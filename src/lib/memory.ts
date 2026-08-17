/**
 * Profil memori perangkat dan batasan yang diturunkan darinya.
 * Batasan ini wajib dipatuhi untuk menghindari OOM pada RAM < 2GB
 * (PRD §10, AGENT.md §11).
 */
export type RamTier = 'low' | 'standard' | 'high';

export interface MemoryProfile {
  tier: RamTier;
  /** Maksimum token context window untuk tier ini (≤ 512). */
  contextWindowTokens: number;
  /** Batas ukuran parameter model (dalam miliar). */
  maxModelParamsB: 1 | 2;
  /** Whisper Tiny hanya untuk RAM ≥ 3GB (PRD §7). */
  whisperEnabled: boolean;
}

/**
 * Klasifikasi RAM perangkat ke tier beserta batasannya.
 * Ambang batas mengikuti spesifikasi minimum PRD (2GB) dan
 * fitur opsional Whisper Tiny (≥ 3GB).
 */
export function classifyRam(totalRamMb: number): MemoryProfile {
  if (totalRamMb < 2048) {
    return {
      tier: 'low',
      contextWindowTokens: 256,
      maxModelParamsB: 1,
      whisperEnabled: false,
    };
  }
  if (totalRamMb < 3072) {
    return {
      tier: 'standard',
      contextWindowTokens: 384,
      maxModelParamsB: 2,
      whisperEnabled: false,
    };
  }
  return {
    tier: 'high',
    contextWindowTokens: 512,
    maxModelParamsB: 2,
    whisperEnabled: true,
  };
}

/**
 * Ambil profil memori perangkat berjalan.
 * Total RAM dibaca dari bridge native (diset oleh modul android/);
 * default konservatif 2048 MB = spesifikasi minimum PRD.
 */
export function getMemoryProfile(): MemoryProfile {
  const totalRamMb = (global as {__PIJAR_TOTAL_RAM_MB__?: number})
    .__PIJAR_TOTAL_RAM_MB__;
  return classifyRam(totalRamMb ?? 2048);
}
