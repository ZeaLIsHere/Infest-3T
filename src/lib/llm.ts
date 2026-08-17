/**
 * Engine LLM luring dan sesi percakapan.
 * Implementasi native MLC LLM (model INT4, ≤ 2B param) dipasang via
 * bridge android/ pada fase 1 (PRD §11). Kelas di sini menyediakan
 * kontrak + placeholder yang bisa diuji tanpa modul native.
 */
import {
  DEFAULT_MAX_TOKENS,
  estimateTokens,
  Message,
  trimToTokenBudget,
} from './contextWindow';

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
 *
 * `retrieveContext` (opsional) dipakai untuk RAG: menyisipkan konteks
 * materi yang relevan sebagai pesan system, ikut dihitung dalam budget
 * token. Total (system prompt + pesan) tetap ≤ maxTokens.
 */
export type ContextRetriever = (question: string) => Promise<string>;

export class ChatSession {
  private readonly history: Message[] = [];
  private readonly messageBudget: number;

  constructor(
    private readonly engine: LlmEngine,
    private readonly systemPrompt: string,
    maxTokens: number = DEFAULT_MAX_TOKENS,
    private readonly retrieveContext?: ContextRetriever,
  ) {
    // Sisakan ruang token untuk system prompt agar total tetap ≤ maxTokens.
    this.messageBudget = Math.max(1, maxTokens - estimateTokens(systemPrompt));
  }

  async ask(question: string): Promise<string> {
    this.history.push({role: 'user', content: question});
    let messages = trimToTokenBudget(this.history, this.messageBudget);
    if (this.retrieveContext) {
      const context = await this.retrieveContext(question);
      if (context.length > 0) {
        messages = trimToTokenBudget(
          [{role: 'system', content: context}, ...messages],
          this.messageBudget,
        );
      }
    }
    const answer = await this.engine.infer(this.systemPrompt, messages);
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
