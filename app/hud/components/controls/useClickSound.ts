import { useCallback } from 'react';
import { useSoundEnabled } from '../../SoundProvider';

/**
 * useClickSound - Audio feedback hook for UI interactions
 *
 * Uses Web Audio API for low-latency click sounds.
 * Generates a short, crisp tone on interaction.
 *
 * Respects the global soundEffectsEnabled setting from SoundProvider.
 *
 * Usage:
 * const { playClick } = useClickSound();
 * <button onClick={playClick}>Click me</button>
 */
export const useClickSound = () => {
  const soundEnabled = useSoundEnabled();

  const playClick = useCallback(() => {
    // Skip if sound effects are disabled globally
    if (!soundEnabled) return;

    try {
      // Create audio context (will be reused if already exists)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create oscillator (tone generator)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Connect nodes: oscillator -> gain -> output
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Configure sound: 1000Hz tone, very short duration
      osc.frequency.value = 1000;
      osc.type = 'sine';

      // Set volume: start at 0.1, fade out quickly
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      // Play for 50ms
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);

      // Clean up after sound completes
      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
        ctx.close();
      }, 100);
    } catch (err) {
      // Silently fail if audio not supported or blocked
      console.warn('Audio playback failed:', err);
    }
  }, [soundEnabled]);

  return { playClick };
};
