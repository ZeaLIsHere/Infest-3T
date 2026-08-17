import {chunksWithinTokenBudget, splitTextIntoChunks} from '../chunking';
import {estimateTokens} from '../contextWindow';

const TEXT = Array.from(
  {length: 40},
  (_, i) => `Kalimat nomor ${i + 1}.`,
).join(' ');

describe('splitTextIntoChunks', () => {
  it('mengembalikan array kosong untuk teks kosong', () => {
    expect(splitTextIntoChunks('')).toEqual([]);
  });

  it('teks pendek menjadi satu chunk', () => {
    const chunks = splitTextIntoChunks('Halo dunia.');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.content).toBe('Halo dunia.');
  });

  it('membagi teks panjang menjadi beberapa chunk', () => {
    const chunks = splitTextIntoChunks(TEXT);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.content.startsWith('Kalimat nomor 1.')).toBe(true);
    expect(chunks[chunks.length - 1]?.content.includes('Kalimat nomor 40.')).toBe(true);
  });

  it('seluruh chunk memenuhi budget token default', () => {
    const chunks = splitTextIntoChunks(TEXT);
    expect(chunksWithinTokenBudget(chunks, 128)).toBe(true);
  });

  it('mempertahankan urutan teks', () => {
    const chunks = splitTextIntoChunks(TEXT);
    const joined = chunks.map(chunk => chunk.content).join(' ');
    expect(joined.indexOf('Kalimat nomor 1.')).toBeLessThan(
      joined.indexOf('Kalimat nomor 20.'),
    );
  });

  it('menghasilkan overlap antar chunk', () => {
    const chunks = splitTextIntoChunks(TEXT);
    expect(chunks.length).toBeGreaterThan(1);
    const firstTail = chunks[0]?.content.slice(-10) ?? '';
    expect(chunks[1]?.content.includes(firstTail)).toBe(true);
  });

  it('menghormati maxTokens yang lebih kecil', () => {
    const chunks = splitTextIntoChunks(TEXT, {maxTokens: 64});
    expect(chunks.length).toBeGreaterThan(2);
    for (const chunk of chunks) {
      expect(estimateTokens(chunk.content)).toBeLessThanOrEqual(64);
    }
  });
});
