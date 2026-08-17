/**
 * Engine LLM luring dan sesi percakapan.
 * Implementasi native MLC LLM (model INT4, ≤ 2B param) dipasang via
 * bridge android/ pada fase 1 (PRD §11). Kelas di sini menyediakan
 * kontrak + placeholder yang bisa diuji tanpa modul native.
 */
import {DEFAULT_MAX_TOKENS, Message, trimToTokenBudget} from './contextWindow';

/** Kontrak engine LLM luring. */
export interface LlmEngine {
  load(): Promise<void>;
  infer(systemPrompt: string, messages: readonly Message[]): Promise<string>;
  /** Lepas memori secara manual (AGENT.md §9). */
  release(): void;
}

/**
 * Implementasi placeholder sampai native binding MLC LLM terpasang.
 * TODO(fase 1): panggil modul native MLC LLM (model INT4, ≤ 2B param)
 * dan batasi context window ≤ 512 token.
 */
export class MlcLlmEngine implements LlmEngine {
  private loaded = false;

  async load(): Promise<void> {
    this.loaded = true;
  }

  async infer(
    _systemPrompt: string,
    _messages: readonly Message[],
  ): Promise<string> {
    if (!this.loaded) {
      throw new Error(
        'MlcLlmEngine belum dimuat. Panggil load() terlebih dahulu.',
      );
    }
    return 'Asisten luring Pijar 3T siap digunakan. (Inferensi model belum tersambung.)';
  }

  release(): void {
    this.loaded = false;
  }
}

/**
 * Sesi percakapan: menyimpan riwayat, memotong context window sesuai
 * budget token, dan meneruskan prompt ke engine.
 */
export class ChatSession {
  private readonly history: Message[] = [];

  constructor(
    private readonly engine: LlmEngine,
    private readonly systemPrompt: string,
    private readonly maxTokens: number = DEFAULT_MAX_TOKENS,
  ) {}

  async ask(question: string): Promise<string> {
    this.history.push({role: 'user', content: question});
    const trimmed = trimToTokenBudget(this.history, this.maxTokens);
    const answer = await this.engine.infer(this.systemPrompt, trimmed);
    this.history.push({role: 'assistant', content: answer});
    return answer;
  }

  getHistory(): readonly Message[] {
    return this.history;
  }

  /** Lepas memori: kosongkan riwayat + rilis engine (AGENT.md §9). */
  dispose(): void {
    this.history.length = 0;
    this.engine.release();
  }
}
