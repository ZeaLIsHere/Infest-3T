/**
 * Manajemen context window percakapan.
 * Constraint: maksimal 512 token (AGENT.md §9, PRD §10).
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/** Budget default sesuai constraint global. */
export const DEFAULT_MAX_TOKENS = 512;

/**
 * Estimasi jumlah token dari teks.
 * Heuristik sederhana: 1 token ≈ 3,5 karakter (konservatif untuk
 * bahasa Indonesia). Dipakai untuk memotong riwayat sebelum dikirim
 * ke engine LLM agar tidak melebihi context window.
 */
export function estimateTokens(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return Math.ceil(text.length / 3.5);
}

/**
 * Potong riwayat percakapan agar total estimasi token ≤ maxTokens.
 * Pesan terbaru (pertanyaan terakhir) selalu dipertahankan agar
 * pertanyaan pengguna tidak pernah hilang, meski melebihi budget.
 */
export function trimToTokenBudget(
  messages: readonly Message[],
  maxTokens: number = DEFAULT_MAX_TOKENS,
): Message[] {
  const result: Message[] = [];
  let used = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (!message) {
      break;
    }
    const cost = estimateTokens(message.content) + 1; // overhead per pesan
    const isNewest = result.length === 0;
    if (!isNewest && used + cost > maxTokens) {
      break;
    }
    result.unshift(message);
    used += cost;
  }
  return result;
}
