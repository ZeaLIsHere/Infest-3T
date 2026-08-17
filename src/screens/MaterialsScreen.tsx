/**
 * Layar Materi: sumber RAG dari buku teks Kurikulum Merdeka.
 * Daftar dibaca dari tabel `materials` (SQLite). Pada fase native, materi
 * masuk via MicroSD / Wi-Fi Direct (PRD §5); tombol "contoh" di bawah
 * memakai pipeline impor nyata agar RAG bisa diverifikasi tanpa native.
 */
import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {getAllMaterials, type MaterialRow} from '../db/materialRepository';
import {HashEmbeddingProvider} from '../lib/embedding';
import {importMaterialFromText} from '../lib/materialImporter';
import {colors, radius, spacing} from '../lib/theme';

// Contoh materi untuk verifikasi pipeline RAG (akan diganti impor file nyata).
const DEMO_TEXT =
  'Fotosintesis adalah proses tumbuhan membuat makanan sendiri menggunakan ' +
  'cahaya matahari. Proses ini terjadi di daun pada bagian yang disebut ' +
  'kloroplas. Kloroplas mengandung zat hijau bernama klorofil yang menyerap ' +
  'cahaya matahari. Bahan yang dibutuhkan fotosintesis adalah air dan karbon ' +
  'dioksida. Hasil fotosintesis adalah glukosa (gula) dan oksigen. Glukosa ' +
  'dipakai tumbuhan sebagai energi untuk tumbuh, sedangkan oksigen dilepaskan ' +
  'ke udara untuk kita bernapas. Fotosintesis terjadi pada siang hari karena ' +
  'membutuhkan cahaya matahari.';

export default function MaterialsScreen() {
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMaterials(await getAllMaterials());
    } catch {
      // DB belum siap: tampilkan daftar kosong.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const importDemo = useCallback(async () => {
    setImporting(true);
    try {
      await importMaterialFromText({
        title: 'IPA Kelas 7 — Fotosintesis (contoh)',
        subject: 'Ilmu Pengetahuan Alam',
        text: DEMO_TEXT,
        provider: new HashEmbeddingProvider(),
      });
      await refresh();
    } catch {
      // Gagal impor: biarkan daftar tetap seperti sebelumnya.
    } finally {
      setImporting(false);
    }
  }, [refresh]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={materials}
      keyExtractor={item => String(item.id)}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subject}>{item.subject}</Text>
          {item.sourcePath != null && (
            <Text style={styles.source}>{item.sourcePath}</Text>
          )}
        </View>
      )}
      ListHeaderComponent={
        <Text style={styles.note}>
          Materi tersedia luring dari buku Kurikulum Merdeka.
        </Text>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={styles.emptySpinner}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Belum ada materi. Muat contoh untuk mencoba RAG, atau salin buku
              teks ke perangkat (MicroSD / Wi-Fi Direct) pada fase native.
            </Text>
            <Pressable
              style={({pressed}) => [
                styles.importButton,
                (pressed || importing) && styles.importButtonDimmed,
              ]}
              onPress={() => {
                importDemo();
              }}
              disabled={importing}
              accessibilityLabel="Muat contoh materi">
              {importing ? (
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.importButtonText}>Muat contoh materi</Text>
              )}
            </Pressable>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, flexGrow: 1},
  note: {color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md},
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {color: colors.textPrimary, fontSize: 16, fontWeight: '600'},
  subject: {color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs},
  source: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  empty: {alignItems: 'center', paddingTop: spacing.xl},
  emptySpinner: {marginTop: spacing.xl},
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  importButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  importButtonDimmed: {opacity: 0.6},
  importButtonText: {color: colors.textOnPrimary, fontWeight: '600'},
});
