import {DEFAULT_MAX_TOKENS, estimateTokens, type Message, trimToTokenBudget} from '../contextWindow';

describe('estimateTokens', () => {
  it('mengembalikan 0 untuk teks kosong', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('proporsional terhadap panjang teks', () => {
    expect(estimateTokens('a'.repeat(350))).toBe(100);
    expect(estimateTokens('a'.repeat(35))).toBe(10);
  });
});

describe('trimToTokenBudget', () => {
  // Setiap pesan ~100 token (350 karakter / 3.5).
  const messages: Message[] = [
    {role: 'user', content: 'a'.repeat(350)},
    {role: 'assistant', content: 'b'.repeat(350)},
    {role: 'user', content: 'c'.repeat(350)},
  ];

  it('menjaga pesan terbaru selalu ada', () => {
    const result = trimToTokenBudget(messages, 50);
    expect(result.length).toBeGreaterThan(0);
    expect(result[result.length - 1]?.content).toBe('c'.repeat(350));
  });

  it('memotong riwayat agar tidak melebihi budget', () => {
    const result = trimToTokenBudget(messages, 210);
    const total = result.reduce((sum, m) => sum + estimateTokens(m.content) + 1, 0);
    expect(total).toBeLessThanOrEqual(210);
    expect(result).toHaveLength(2);
    // Pesan tertua dibuang.
    expect(result[0]?.role).toBe('assistant');
  });

  it('mengembalikan semua pesan bila muat', () => {
    const result = trimToTokenBudget(messages, DEFAULT_MAX_TOKENS);
    expect(result).toHaveLength(3);
  });

  it('mengembalikan array kosong untuk input kosong', () => {
    expect(trimToTokenBudget([])).toHaveLength(0);
  });
});
