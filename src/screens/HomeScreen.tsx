/**
 * Beranda: pintu masuk ke fitur utama MVP.
 */
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import NetworkStatusIndicator from '../components/NetworkStatusIndicator';
import {colors, radius, spacing} from '../lib/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MENU: ReadonlyArray<{
  title: string;
  subtitle: string;
  route: 'Chat' | 'Materials' | 'Progress';
}> = [
  {title: 'Tanya AI', subtitle: 'Belajar interaktif dengan asisten luring', route: 'Chat'},
  {title: 'Materi', subtitle: 'Buku teks Kurikulum Merdeka (RAG)', route: 'Materials'},
  {title: 'Progres', subtitle: 'Streak & waktu belajar harian', route: 'Progress'},
];

export default function HomeScreen({navigation}: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Pijar 3T</Text>
        <NetworkStatusIndicator />
      </View>
      <Text style={styles.tagline}>Belajar kapan saja, tanpa internet.</Text>
      {MENU.map(item => (
        <Pressable
          key={item.route}
          style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate(item.route)}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {color: colors.textPrimary, fontSize: 28, fontWeight: '700'},
  tagline: {color: colors.textSecondary, fontSize: 14, marginBottom: spacing.xl},
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPressed: {opacity: 0.7},
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {color: colors.textSecondary, fontSize: 13},
});
