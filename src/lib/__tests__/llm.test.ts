import {DEFAULT_MAX_TOKENS, type Message} from '../contextWindow';
import {ChatSession, MlcLlmEngine, type LlmEngine} from '../llm';

class FakeEngine implements LlmEngine {
  released = false;
  lastMessages: readonly Message[] = [];

  async load(): Promise<void> {}

  async infer(
    _systemPrompt: string,
    messages: readonly Message[],
  ): Promise<string> {
    this.lastMessages = messages;
    return 'jawaban';
  }

  release(): void {
    this.released = true;
  }
}

describe('ChatSession', () => {
  it('menambah riwayat dan mengembalikan jawaban', async () => {
    const engine = new FakeEngine();
    const session = new ChatSession(engine, 'sistem');

    const answer = await session.ask('Apa itu fotosintesis?');

    expect(answer).toBe('jawaban');
    expect(session.getHistory()).toHaveLength(2);
    expect(session.getHistory()[0]).toEqual({
      role: 'user',
      content: 'Apa itu fotosintesis?',
    });
    expect(session.getHistory()[1]).toEqual({
      role: 'assistant',
      content: 'jawaban',
    });
  });

  it('memotong riwayat sesuai budget token sebelum inferensi', async () => {
    const engine = new FakeEngine();
    const session = new ChatSession(engine, 'sistem', 40);

    await session.ask('Pertanyaan 1 ' + 'x'.repeat(100));
    await session.ask('Pertanyaan 2 ' + 'x'.repeat(100));

    // Yang dikirim engine harus ≤ 2 pesan terakhir (budget kecil).
    expect(engine.lastMessages.length).toBeLessThanOrEqual(2);
    expect(
      engine.lastMessages[engine.lastMessages.length - 1]?.content,
    ).toContain('Pertanyaan 2');
  });

  it('dispose melepaskan memori engine', async () => {
    const engine = new FakeEngine();
    const session = new ChatSession(engine, 'sistem');

    await session.ask('pertanyaan');
    session.dispose();

    expect(engine.released).toBe(true);
    expect(session.getHistory()).toHaveLength(0);
  });

  it('menyisipkan konteks RAG sebagai pesan system sebelum riwayat', async () => {
    const engine = new FakeEngine();
    const session = new ChatSession(
      engine,
      'sistem',
      DEFAULT_MAX_TOKENS,
      async () => 'KONTEKS DARI MATERI',
    );

    await session.ask('Apa itu fotosintesis?');

    expect(engine.lastMessages[0]?.role).toBe('system');
    expect(engine.lastMessages[0]?.content).toBe('KONTEKS DARI MATERI');
    expect(engine.lastMessages[engine.lastMessages.length - 1]?.content).toBe(
      'Apa itu fotosintesis?',
    );
  });

  it('konteks kosong tidak ditambahkan ke pesan', async () => {
    const engine = new FakeEngine();
    const session = new ChatSession(
      engine,
      'sistem',
      DEFAULT_MAX_TOKENS,
      async () => '',
    );

    await session.ask('pertanyaan');

    expect(engine.lastMessages).toHaveLength(1);
    expect(engine.lastMessages[0]?.role).toBe('user');
  });

  it('konteks besar dipotong agar total tetap dalam budget token', async () => {
    const engine = new FakeEngine();
    // Budget = 40 - token system prompt ('sistem' = 2) = 38.
    const session = new ChatSession(engine, 'sistem', 40, async () =>
      'x'.repeat(1000),
    );

    await session.ask('pertanyaan singkat');

    const total = engine.lastMessages.reduce(
      (sum, m) => sum + Math.ceil(m.content.length / 3.5) + 1,
      0,
    );
    expect(total).toBeLessThanOrEqual(38);
  });
});

describe('MlcLlmEngine (placeholder)', () => {
  it('menolak inferensi sebelum load', async () => {
    const engine = new MlcLlmEngine();
    await expect(engine.infer('sistem', [])).rejects.toThrow('belum dimuat');
  });

  it('bisa diinferensi setelah load', async () => {
    const engine = new MlcLlmEngine();
    await engine.load();
    await expect(engine.infer('sistem', [])).resolves.toContain('Pijar 3T');
  });
});
