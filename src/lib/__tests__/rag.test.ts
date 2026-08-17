import type {EmbeddingProvider} from '../embedding';
import {buildRagContext, retrieveRelevantChunks, type ChunkStore} from '../rag';

const queryVector = new Float32Array([1, 0, 0]);

const provider: EmbeddingProvider = {
  dimension: 3,
  embed: jest.fn(async () => queryVector),
};

function storeWith(chunks: Array<{id: number; content: string; vector: number[]}>): ChunkStore {
  return {
    all: jest.fn(async () =>
      chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        embedding: new Float32Array(chunk.vector),
      })),
    ),
  };
}

describe('retrieveRelevantChunks', () => {
  it('mengembalikan chunk paling mirip secara berurutan', async () => {
    const store = storeWith([
      {id: 1, content: 'paling cocok', vector: [1, 0, 0]},
      {id: 2, content: 'agak cocok', vector: [0.9, 0.1, 0]},
      {id: 3, content: 'tidak cocok', vector: [0, 1, 0]},
    ]);

    const result = await retrieveRelevantChunks('pertanyaan', provider, store);

    expect(result.map(r => r.content)).toEqual([
      'paling cocok',
      'agak cocok',
      'tidak cocok',
    ]);
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0);
    expect(result[1]?.score).toBeGreaterThan(result[2]?.score ?? 0);
  });

  it('menghormati batas limit', async () => {
    const store = storeWith([
      {id: 1, content: 'a', vector: [1, 0]},
      {id: 2, content: 'b', vector: [0, 1]},
      {id: 3, content: 'c', vector: [0, -1]},
    ]);

    const result = await retrieveRelevantChunks('q', provider, store, 2);

    expect(result).toHaveLength(2);
  });
});

describe('buildRagContext', () => {
  it('mengembalikan string kosong untuk input kosong', () => {
    expect(buildRagContext([])).toBe('');
  });

  it('memotong konteks agar muat dalam budget token', () => {
    const chunks = [
      {content: 'x'.repeat(100), score: 1}, // ~29 token
      {content: 'y'.repeat(100), score: 0.9},
    ];

    const context = buildRagContext(chunks, 40);

    expect(context).toBe('x'.repeat(100)); // chunk kedua tidak muat.
  });

  it('menggabungkan chunk yang muat', () => {
    const chunks = [
      {content: 'aaa', score: 1},
      {content: 'bbb', score: 0.9},
    ];

    const context = buildRagContext(chunks, 200);

    expect(context).toBe('aaa\n\nbbb');
  });
});
