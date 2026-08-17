import {classifyRam} from '../memory';

describe('classifyRam', () => {
  it('tier low untuk RAM < 2048 MB', () => {
    const profile = classifyRam(1536);
    expect(profile.tier).toBe('low');
    expect(profile.contextWindowTokens).toBe(256);
    expect(profile.maxModelParamsB).toBe(1);
    expect(profile.whisperEnabled).toBe(false);
  });

  it('tier standard untuk RAM 2048–3071 MB', () => {
    expect(classifyRam(2048).tier).toBe('standard');
    expect(classifyRam(3071).tier).toBe('standard');
    expect(classifyRam(2048).contextWindowTokens).toBe(384);
  });

  it('tier high untuk RAM >= 3072 MB dengan Whisper aktif', () => {
    const profile = classifyRam(3072);
    expect(profile.tier).toBe('high');
    expect(profile.contextWindowTokens).toBe(512);
    expect(profile.whisperEnabled).toBe(true);
  });

  it('tidak pernah melebihi batas 512 token', () => {
    expect(classifyRam(8192).contextWindowTokens).toBeLessThanOrEqual(512);
  });
});
