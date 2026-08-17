/**
 * Layar Materi: sumber RAG dari buku teks Kurikulum Merdeka.
 * Data asli berasal dari tabel `materials` (SQLite) yang diisi lewat
 * sinkronisasi MicroSD/Wi-Fi Direct (fase 2, PRD §5).
 */
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing} from '../lib/theme';

interface Material {
  id: string;
  title: string;
  subject: string;
}

// Sampel sementara sebelum pipeline impor materi tersambung.
const SAMPLE_MATERIALS: ReadonlyArray<Material> = [
  {id: '1', title: 'IPA Kelas 7 — Bab 1', subject: 'Ilmu Pengetahuan Alam'},
  {id: '2', title: 'Matematika Kelas 8 — Bab 2', subject: 'Matematika'},
  {id: '3', title: 'B. Indonesia Kelas 9 — Bab 3', subject: 'Bahasa Indonesia'},
];

export default function MaterialsScreen() {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={SAMPLE_MATERIALS}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subject}>{item.subject}</Text>
        </View>
      )}
      ListHeaderComponent={
        <Text style={styles.note}>
          Materi tersedia luring dari buku Kurikulum Merdeka.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg},
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
});
