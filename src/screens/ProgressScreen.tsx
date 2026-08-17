/**
 * Layar Progres: streak & waktu belajar.
 * Data diambil dari tabel `study_sessions` (SQLite); perhitungan streak
 * memakai computeStreak (src/lib/streak.ts).
 */
import {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {getStudySessions} from '../db/studyRepository';
import {computeStreak, toDateKey, type StudySession} from '../lib/streak';
import {colors, radius, spacing} from '../lib/theme';

export default function ProgressScreen() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getStudySessions()
      .then(list => {
        if (active) {
          setSessions(list);
        }
      })
      .catch(() => {
        // DB belum siap: tampilkan daftar kosong.
      })
      .finally(() => {
        if (active) {
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const totalMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + session.minutes, 0),
    [sessions],
  );
  const todayMinutes = useMemo(() => {
    const today = toDateKey(new Date());
    const todaySession = sessions.find(session => session.date === today);
    return todaySession?.minutes ?? 0;
  }, [sessions]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakLabel}>hari streak belajar</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.minutesValue}>{todayMinutes} menit</Text>
        <Text style={styles.minutesLabel}>belajar hari ini</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.minutesValue}>{totalMinutes} menit</Text>
        <Text style={styles.minutesLabel}>total belajar</Text>
      </View>
      {loaded && sessions.length === 0 && (
        <Text style={styles.note}>
          Belum ada sesi belajar tercatat. Buka Tanya AI dan belajar beberapa
          saat — waktu belajarmu akan tersimpan otomatis di perangkat.
        </Text>
      )}
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
  streakLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  minutesValue: {color: colors.textPrimary, fontSize: 24, fontWeight: '600'},
  minutesLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  note: {color: colors.textSecondary, fontSize: 13, lineHeight: 20},
});
