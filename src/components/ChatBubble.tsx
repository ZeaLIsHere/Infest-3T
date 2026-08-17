/**
 * Gelembung pesan chat (user di kanan, asisten di kiri).
 */
import {StyleSheet, Text, View} from 'react-native';
import type {Message} from '../lib/contextWindow';
import {colors, radius, spacing} from '../lib/theme';

interface ChatBubbleProps {
  role: Message['role'];
  content: string;
}

export default function ChatBubble({role, content}: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={isUser ? styles.textUser : styles.textAssistant}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', marginVertical: spacing.xs},
  rowUser: {justifyContent: 'flex-end'},
  rowAssistant: {justifyContent: 'flex-start'},
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleUser: {backgroundColor: colors.primary},
  bubbleAssistant: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textUser: {color: colors.textOnPrimary},
  textAssistant: {color: colors.textPrimary},
});
