/**
 * Indikator status jaringan (luring vs online).
 * Status "syncing" dicadangkan untuk proses sinkronisasi (PRD §9).
 */
import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ConnectionStatus, subscribeConnection} from '../lib/network';
import {colors, radius, spacing} from '../lib/theme';

const LABELS: Record<ConnectionStatus, string> = {
  offline: 'Luring',
  online: 'Online',
  syncing: 'Sinkronisasi…',
};

export default function NetworkStatusIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('offline');

  useEffect(() => subscribeConnection(setStatus), []);

  const isOnline = status === 'online';
  return (
    <View
      style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}
      accessibilityLabel={`Status jaringan: ${LABELS[status]}`}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.label}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceVariant,
  },
  badgeOnline: {borderColor: colors.success},
  badgeOffline: {borderColor: colors.error},
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  dotOnline: {backgroundColor: colors.success},
  dotOffline: {backgroundColor: colors.error},
  label: {color: colors.textSecondary, fontSize: 12},
});
