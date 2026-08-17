import {HashEmbeddingProvider} from '../embedding';

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

describe('HashEmbeddingProvider', () => {
  const provider = new HashEmbeddingProvider();

  it('menghasilkan vektor 128 dimensi', async () => {
    const vector = await provider.embed('fotosintesis');
    expect(vector.length).toBe(128);
  });

  it('deterministik untuk input yang sama', async () => {
    const a = await provider.embed('fotosintesis');
    const b = await provider.embed('fotosintesis');
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it('teks berbeda menghasilkan vektor berbeda', async () => {
    const a = await provider.embed('fotosintesis');
    const b = await provider.embed('sejarah indonesia');
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it('teks serupa lebih mirip daripada teks berbeda', async () => {
    const query = await provider.embed('apa itu fotosintesis pada tumbuhan');
    const related = await provider.embed('fotosintesis pada tumbuhan');
    const unrelated = await provider.embed('rumus matematika aljabar');
    expect(cosine(query, related)).toBeGreaterThan(cosine(query, unrelated));
  });

  it('vektor ternormalisasi L2', async () => {
    const vector = await provider.embed('fotosintesis');
    let norm = 0;
    for (const value of vector) {
      norm += value * value;
    }
    expect(Math.sqrt(norm)).toBeCloseTo(1);
  });
});
