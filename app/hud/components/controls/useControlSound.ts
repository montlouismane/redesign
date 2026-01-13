'use client';

import { useRef, useCallback } from 'react';
import { useSoundEnabled } from '../../SoundProvider';

type SoundType = 'dial' | 'slider' | 'button' | 'toggle' | 'confirm';

/**
 * Shared audio utility for HUD controls
 *
 * Provides distinct tick/click sounds for different control types:
 * - dial: Lower, resonant tick like a mechanical potentiometer (220-330 Hz)
 * - slider: Soft, subtle tick like a notched slider (440-550 Hz)
 * - button: Higher pitched click (660-880 Hz) - used by TimeAdjuster
 * - toggle: Medium click for on/off chip toggles (500-600 Hz)
 * - confirm: Satisfying confirmation sound for save/submit actions (two-tone)
 *
 * All sounds use Web Audio API with quick attack and fast decay
 * for a satisfying tactile feel without being intrusive.
 *
 * Respects the global soundEffectsEnabled setting from SoundProvider.
 */
export function useControlSound(type: SoundType = 'dial') {
  const soundEnabled = useSoundEnabled();
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTime = useRef<number>(0);

  // Get or create audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play tick sound with rate limiting to prevent audio spam during rapid dragging
  const playTick = useCallback((direction: 'up' | 'down' = 'up') => {
    // Skip if sound effects are disabled globally
    if (!soundEnabled) return;

    try {
      const now = performance.now();
      // Rate limit: minimum 30ms between ticks (prevents audio spam)
      if (now - lastPlayTime.current < 30) return;
      lastPlayTime.current = now;

      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Configure sound based on control type
      let baseFreq: number;
      let gain: number;
      let decay: number;
      let waveType: OscillatorType;

      switch (type) {
        case 'dial':
          // Low, resonant tick - mechanical potentiometer feel
          baseFreq = direction === 'up' ? 330 : 275;
          gain = 0.08; // Quieter
          decay = 0.06; // Shorter decay
          waveType = 'triangle'; // Warmer tone
          break;

        case 'slider':
          // Soft, subtle tick - notched slider feel
          baseFreq = direction === 'up' ? 550 : 480;
          gain = 0.06; // Very quiet
          decay = 0.04; // Very short
          waveType = 'sine'; // Pure, soft tone
          break;

        case 'toggle':
          // Medium click for chip toggles - distinct on/off sounds
          baseFreq = direction === 'up' ? 600 : 500;
          gain = 0.1;
          decay = 0.05;
          waveType = 'sine';
          break;

        case 'confirm':
          // Two-tone confirmation sound - satisfying "success" feel
          // This is a special case with two notes
          {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            const gain2 = ctx.createGain();

            // First note: C5 (523 Hz)
            osc1.frequency.setValueAtTime(523, ctx.currentTime);
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0, ctx.currentTime);
            gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

            // Second note: E5 (659 Hz) - starts slightly after
            osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.05);
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0, ctx.currentTime + 0.05);
            gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(ctx.destination);
            gain2.connect(ctx.destination);

            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime + 0.05);
            osc1.stop(ctx.currentTime + 0.2);
            osc2.stop(ctx.currentTime + 0.25);
            return; // Early return for confirm sound
          }

        case 'button':
        default:
          // Higher pitched click - button press
          baseFreq = direction === 'up' ? 880 : 660;
          gain = 0.15;
          decay = 0.08;
          waveType = 'sine';
          break;
      }

      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.type = waveType;

      // Quick attack, fast decay for a "tick" feel
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + decay + 0.01);
    } catch {
      // Audio not supported or blocked - fail silently
    }
  }, [getAudioContext, type, soundEnabled]);

  return { playTick };
}
