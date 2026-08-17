/**
 * Layar Progres: streak & total waktu belajar.
 * Data asli dari tabel `study_sessions` (SQLite); perhitungan streak
 * memakai computeStreak (src/lib/streak.ts).
 */
import {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import type {StudySession} from '../lib/streak';
import {computeStreak} from '../lib/streak';
import {colors, radius, spacing} from '../lib/theme';

// Sampel sementara; diganti query SQLite pada fase 3.
const SAMPLE_SESSIONS: ReadonlyArray<StudySession> = [
  {date: '2026-08-15', minutes: 35},
  {date: '2026-08-16', minutes: 42},
  {date: '2026-08-17', minutes: 20},
];

export default function ProgressScreen() {
  const streak = useMemo(() => computeStreak(SAMPLE_SESSIONS), []);
  const totalMinutes = useMemo(
    () => SAMPLE_SESSIONS.reduce((sum, session) => sum + session.minutes, 0),
    [],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakLabel}>hari streak belajar</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.minutesValue}>{totalMinutes} menit</Text>
        <Text style={styles.minutesLabel}>total belajar (sampel)</Text>
      </View>
      <Text style={styles.note}>
        Target: 30+ menit belajar luring per hari. Data tersimpan di SQLite dan
        tersinkronisasi otomatis saat perangkat online.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg},
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  streakValue: {color: colors.primary, fontSize: 40, fontWeight: '700'},
  streakLabel: {color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs},
  minutesValue: {color: colors.textPrimary, fontSize: 24, fontWeight: '600'},
  minutesLabel: {color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs},
  note: {color: colors.textSecondary, fontSize: 13, lineHeight: 20},
});
