import {blobToEmbedding, cosineSimilarity, embeddingToBlob} from '../vector';

describe('embeddingToBlob / blobToEmbedding', () => {
  it('roundtrip float32 → blob → float32', () => {
    const original = new Float32Array([1.5, -2, 0, 42]);
    const blob = embeddingToBlob(original);
    expect(blob).toBeInstanceOf(Uint8Array);
    expect(blob.byteLength).toBe(original.length * 4);

    const restored = blobToEmbedding(blob);
    expect(Array.from(restored)).toEqual([1.5, -2, 0, 42]);
  });
});

describe('cosineSimilarity', () => {
  it('searah = 1 (tidak peduli magnitudo)', () => {
    expect(cosineSimilarity(new Float32Array([1, 0, 0]), new Float32Array([2, 0, 0]))).toBeCloseTo(1);
  });

  it('ortogonal = 0', () => {
    expect(cosineSimilarity(new Float32Array([1, 0, 0]), new Float32Array([0, 1, 0]))).toBeCloseTo(0);
  });

  it('berlawanan arah = -1', () => {
    expect(cosineSimilarity(new Float32Array([1, 0]), new Float32Array([-1, 0]))).toBeCloseTo(-1);
  });

  it('dimensi tidak cocok = 0', () => {
    expect(cosineSimilarity(new Float32Array([1]), new Float32Array([1, 1]))).toBe(0);
  });

  it('vektor nol = 0', () => {
    expect(cosineSimilarity(new Float32Array([0, 0]), new Float32Array([1, 0]))).toBe(0);
  });
});
