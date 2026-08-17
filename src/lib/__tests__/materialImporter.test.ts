jest.mock('react-native-sqlite-storage');

import {getAllChunkEmbeddings} from '../../db/materialRepository';
import {HashEmbeddingProvider} from '../embedding';
import {importMaterialFromText} from '../materialImporter';

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

describe('importMaterialFromText', () => {
  it('memotong, mengembed, dan menyimpan materi', async () => {
    const result = await importMaterialFromText({
      title: 'IPA Bab 1',
      subject: 'IPA',
      text: 'Kalimat satu. '.repeat(200),
      provider: new HashEmbeddingProvider(),
    });

    expect(result.chunkCount).toBeGreaterThan(1);
    expect(result.materialId).toBe(1);

    const chunks = await getAllChunkEmbeddings();
    expect(chunks).toHaveLength(result.chunkCount);
    expect(chunks[0]?.content.length).toBeGreaterThan(0);
  });

  it('teks pendek menjadi satu chunk', async () => {
    const result = await importMaterialFromText({
      title: 'Catatan',
      subject: 'Umum',
      text: 'Halo dunia.',
      provider: new HashEmbeddingProvider(),
    });

    expect(result.chunkCount).toBe(1);
    const chunks = await getAllChunkEmbeddings();
    expect(chunks[0]?.content).toBe('Halo dunia.');
  });
});
