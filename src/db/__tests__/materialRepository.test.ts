jest.mock('react-native-sqlite-storage');

import {getAllChunkEmbeddings, saveMaterial} from '../materialRepository';

const sqliteMock = jest.requireMock('react-native-sqlite-storage') as {
  __resetMaterials: () => void;
  __resetStudySessions: () => void;
  __resetSyncQueue: () => void;
};

beforeEach(() => {
  sqliteMock.__resetMaterials();
  sqliteMock.__resetStudySessions();
  sqliteMock.__resetSyncQueue();
});

describe('saveMaterial', () => {
  it('menyimpan materi beserta chunk dan mengembalikan id', async () => {
    const materialId = await saveMaterial({
      title: 'IPA Kelas 7 — Bab 1',
      subject: 'Ilmu Pengetahuan Alam',
      sourcePath: '/sdcard/Pijar3T/materi/ipa-bab1.txt',
      chunks: [
        {content: 'Chunk satu', embedding: new Float32Array([1, 0, 0])},
        {content: 'Chunk dua', embedding: new Float32Array([0, 1, 0])},
      ],
    });

    expect(materialId).toBe(1);
  });

  it('getAllChunkEmbeddings mengembalikan chunk + embedding (roundtrip)', async () => {
    await saveMaterial({
      title: 'Materi A',
      subject: 'Matematika',
      chunks: [
        {content: 'Chunk satu', embedding: new Float32Array([1.5, -2, 0])},
        {content: 'Chunk dua', embedding: new Float32Array([0, 1, 0.25])},
      ],
    });

    const chunks = await getAllChunkEmbeddings();

    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.content).toBe('Chunk satu');
    expect(Array.from(chunks[0]?.embedding ?? [])).toEqual([1.5, -2, 0]);
    expect(Array.from(chunks[1]?.embedding ?? [])).toEqual([0, 1, 0.25]);
  });

  it('sourcePath opsional boleh dihilangkan', async () => {
    const materialId = await saveMaterial({
      title: 'Materi B',
      subject: 'Bahasa Indonesia',
      chunks: [{content: 'Satu', embedding: new Float32Array([1])}],
    });

    expect(materialId).toBe(1);
    expect(await getAllChunkEmbeddings()).toHaveLength(1);
  });
});
