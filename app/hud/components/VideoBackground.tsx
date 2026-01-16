'use client';

import React, { useRef, useEffect } from 'react';
import styles from '../../styles/background.module.css';

interface VideoBackgroundProps {
    src?: string;
    animationsEnabled?: boolean;
}

/**
 * VideoBackground - Fullscreen looping video background
 *
 * Alternative to ThreeBackground for a more cinematic feel.
 * Uses object-fit: cover for proper aspect ratio handling.
 *
 * Usage:
 * <VideoBackground
 *   src="/hud-bg.mp4"
 *   animationsEnabled={settings.animationsEnabled}
 * />
 */
export const VideoBackground = ({
    src = '/hud-bg.mp4',
    animationsEnabled = true,
}: VideoBackgroundProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (animationsEnabled) {
            video.play().catch(err => {
                // Autoplay blocked - user interaction required
                console.log('Video autoplay blocked:', err);
            });
        } else {
            video.pause();
        }
    }, [animationsEnabled]);

    if (!animationsEnabled) {
        return null;
    }

    return (
        <video
            ref={videoRef}
            className={styles.videoBg}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
        />
    );
};
