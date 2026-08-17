/**
 * Layar Tanya AI: chatbot luring (MLC LLM, context window ≤ 512 token).
 * Riwayat dipotong otomatis oleh ChatSession; memori dilepas manual
 * saat screen ditutup (AGENT.md §9).
 */
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ChatBubble from '../components/ChatBubble';
import type {Message} from '../lib/contextWindow';
import {ChatSession, MlcLlmEngine} from '../lib/llm';
import {colors, radius, spacing} from '../lib/theme';

const SYSTEM_PROMPT =
  'Kamu adalah asisten belajar Pijar 3T untuk siswa SMP/SMA di Indonesia. ' +
  'Jawab singkat, jelas, ramah, dan sesuai kurikulum. Gunakan bahasa Indonesia.';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<ChatSession | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const session = new ChatSession(new MlcLlmEngine(), SYSTEM_PROMPT);
    sessionRef.current = session;
    // Pelepasan memori manual saat screen ditutup (AGENT.md §9).
    return () => {
      session.dispose();
      sessionRef.current = null;
    };
  }, []);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
