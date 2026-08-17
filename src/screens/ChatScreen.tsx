/**
 * Layar Tanya AI: chatbot luring (MLC LLM, context window ≤ 512 token).
 * Riwayat dipotong otomatis oleh ChatSession; memori dilepas manual saat
 * screen ditutup (AGENT.md §9). Lama membuka layar ini dicatat sebagai
 * sesi belajar harian (SQLite) untuk perhitungan streak.
 */
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ChatBubble from '../components/ChatBubble';
import {getAllChunkEmbeddings} from '../db/materialRepository';
import {recordStudyMinutes} from '../db/studyRepository';
import type {Message} from '../lib/contextWindow';
import {HashEmbeddingProvider} from '../lib/embedding';
import {ChatSession, MlcLlmEngine} from '../lib/llm';
import {createRagContextRetriever, type ChunkStore} from '../lib/rag';
import {getMemoryProfile} from '../lib/memory';
import {toDateKey} from '../lib/streak';
import {colors, radius, spacing} from '../lib/theme';

const SYSTEM_PROMPT =
  'Kamu adalah asisten belajar Pijar 3T untuk siswa SMP/SMA di Indonesia. ' +
  'Jawab singkat, jelas, ramah, dan sesuai kurikulum. Gunakan bahasa Indonesia.';

// Sumber chunk RAG dari SQLite. Embedding memakai HashEmbeddingProvider
// (deterministik, tanpa native) untuk MVP; ganti ke USE Lite via TFLite
// saat build native terpasang. Bila retrieval gagal, chat tetap berjalan
// tanpa konteks materi (degradasi halus).
const chunkStore: ChunkStore = {all: getAllChunkEmbeddings};
const ragContextRetriever = createRagContextRetriever(
  new HashEmbeddingProvider(),
  chunkStore,
);

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<ChatSession | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // Ambil konteks RAG untuk pertanyaan; bila gagal (embedding belum
  // terpasang / korpus kosong), kembalikan string kosong agar chat tetap jalan.
  const retrieveContext = useCallback(
    async (question: string): Promise<string> => {
      try {
        return await ragContextRetriever(question);
      } catch {
        return '';
      }
    },
    [],
  );

  // Batas context window mengikuti profil RAM perangkat (PRD §7).
  const maxTokens = useMemo(() => getMemoryProfile().contextWindowTokens, []);

  // Catat waktu belajar: selisih sejak layar dibuka, dibulatkan ke bawah
  // (minimal 1 menit agar data tidak terlalu bising).
  const flushStudyTime = useCallback(() => {
    const start = sessionStartRef.current;
    if (!start) {
      return;
    }
    const minutes = Math.floor((Date.now() - start.getTime()) / 60000);
    sessionStartRef.current = new Date();
    if (minutes < 1) {
      return;
    }
    recordStudyMinutes(toDateKey(new Date()), minutes).catch(() => {
      // DB belum siap (inisialisasi native belum selesai): lewati pencatatan.
    });
  }, []);

  useEffect(() => {
    const session = new ChatSession(
      new MlcLlmEngine(),
      SYSTEM_PROMPT,
      maxTokens,
      retrieveContext,
    );
    sessionRef.current = session;
    // Pelepasan memori manual saat screen ditutup (AGENT.md §9).
    return () => {
      session.dispose();
      sessionRef.current = null;
    };
  }, [maxTokens, retrieveContext]);

  useEffect(() => {
    sessionStartRef.current = new Date();
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        flushStudyTime();
      }
    });
    return () => {
      subscription.remove();
      flushStudyTime();
    };
  }, [flushStudyTime]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (text.length === 0 || loading) {
      return;
    }
    const session = sessionRef.current;
    if (!session) {
      return;
    }
    setInput('');
    setMessages(previous => [...previous, {role: 'user', content: text}]);
    setLoading(true);
    try {
      const answer = await session.ask(text);
      setMessages(previous => [
        ...previous,
        {role: 'assistant', content: answer},
      ]);
    } catch {
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: 'Maaf, terjadi kendala saat memproses pertanyaan.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={(_item, index) => String(index)}
        renderItem={({item}) => (
          <ChatBubble role={item.role} content={item.content} />
        )}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({animated: false})
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Tanyakan apa saja, misalnya "Apa itu fotosintesis?"
          </Text>
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Tulis pertanyaanmu…"
          placeholderTextColor={colors.textSecondary}
          multiline
          editable={!loading}
        />
        <Pressable
          style={({pressed}) => [
            styles.sendButton,
            (pressed || loading) && styles.sendButtonDimmed,
          ]}
          onPress={() => {
            send();
          }}
          disabled={loading}
          accessibilityLabel="Kirim pertanyaan">
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} size="small" />
          ) : (
            <Text style={styles.sendText}>Kirim</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  list: {flex: 1},
  listContent: {padding: spacing.lg, flexGrow: 1},
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    marginLeft: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendButtonDimmed: {opacity: 0.6},
  sendText: {color: colors.textOnPrimary, fontWeight: '600'},
});
