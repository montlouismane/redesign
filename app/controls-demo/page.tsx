'use client';

import React, { useState } from 'react';
import styles from './demo.module.css';
import { HorizontalSlider, RotaryDial, VerticalSlider, ToggleSwitch, MetallicSlider, MetallicDial } from '../hud/components/controls';

export default function ControlsDemoPage() {
    // Demo state for each control type
    const [dialValue, setDialValue] = useState(65);
    const [sliderValue, setSliderValue] = useState(500);
    const [verticalValue, setVerticalValue] = useState(30);
    const [toggleValue, setToggleValue] = useState(false);
    const [modeValue, setModeValue] = useState('t-mode');
    const [tags, setTags] = useState(['SCAM', 'RUG']);
    const [sectionExpanded, setSectionExpanded] = useState(true);

    return (
        <div className={styles.demoPage}>
            <header className={styles.header}>
                <h1>Control Components Demo</h1>
                <p>Testing tactile controls for Agent Settings Board</p>
            </header>

            <div className={styles.grid}>
                {/* MetallicDial Demo - New Design with Smooth Drag */}
                <section className={styles.demoSection}>
                    <h2>MetallicDial (Smooth Circular Drag)</h2>
                    <p className={styles.description}>
                        Smooth atan-based drag, active tick marks, no +/- buttons, safe zone
                    </p>
                    <div className={styles.controlWrapper}>
                        <MetallicDial
                            value={dialValue}
                            onChange={setDialValue}
                            min={0}
                            max={100}
                            step={1}
                            degrees={270}
                            numTicks={25}
                            safeMin={60}
                            safeMax={80}
                            label="Min Buy Confidence"
                            unit="%"
                            size={140}
                        />
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>{dialValue}%</code>
                    </div>
                </section>

                {/* Horizontal Slider Demo - New Metallic Design */}
                <section className={styles.demoSection}>
                    <h2>HorizontalSlider (Metallic Copper)</h2>
                    <p className={styles.description}>
                        Native range input with 3D brushed copper aesthetic, tick marks, floating label
                    </p>
                    <div className={styles.controlWrapper}>
                        <HorizontalSlider
                            value={sliderValue}
                            onChange={setSliderValue}
                            min={40}
                            max={1000}
                            step={10}
                            safeMin={40}
                            safeMax={160}
                            label="Low Tier Size"
                            unit="ADA"
                            tickCount={11}
                            showTicks={true}
                        />
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>{sliderValue} ADA</code>
                    </div>
                </section>

                {/* MetallicSlider Demo - Standalone Component */}
                <section className={styles.demoSection}>
                    <h2>MetallicSlider (Standalone)</h2>
                    <p className={styles.description}>
                        Clean standalone slider with snap-to-tick behavior
                    </p>
                    <div className={styles.controlWrapper}>
                        <MetallicSlider
                            value={dialValue}
                            onChange={setDialValue}
                            min={0}
                            max={100}
                            step={5}
                            tickCount={11}
                            label="Confidence Level"
                            unit="%"
                            showTicks={true}
                            snapToTicks={true}
                        />
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>{dialValue}%</code>
                    </div>
                </section>

                {/* Vertical Slider Demo - New Metallic Design */}
                <section className={styles.demoSection}>
                    <h2>VerticalSlider (Metallic Copper)</h2>
                    <p className={styles.description}>
                        Vertical orientation with brushed copper aesthetic, tick marks, floating label
                    </p>
                    <div className={styles.controlWrapper}>
                        <VerticalSlider
                            value={verticalValue}
                            onChange={setVerticalValue}
                            min={1}
                            max={120}
                            step={5}
                            safeMin={15}
                            safeMax={60}
                            label="Min Hold Time"
                            unit="min"
                            tickCount={7}
                            showTicks={true}
                        />
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>{verticalValue} min</code>
                    </div>
                </section>

                {/* Toggle Switch Demo */}
                <section className={styles.demoSection}>
                    <h2>ToggleSwitch (On/Off)</h2>
                    <p className={styles.description}>
                        Mechanical toggle with click sound, LED glow
                    </p>
                    <div className={styles.controlWrapper}>
                        <div className={styles.placeholder}>
                            <div
                                className={`${styles.toggleSwitch} ${toggleValue ? styles.toggleOn : ''}`}
                                onClick={() => setToggleValue(v => !v)}
                            >
                                <div className={styles.toggleTrack}>
                                    <div className={styles.toggleThumb} />
                                </div>
                                <span className={styles.toggleLabel}>
                                    {toggleValue ? 'ON' : 'OFF'}
                                </span>
                                {toggleValue && <div className={styles.ledGlow} />}
                            </div>
                            <div className={styles.label}>Paper Trading</div>
                        </div>
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>{toggleValue ? 'ON' : 'OFF'}</code>
                    </div>
                </section>

                {/* Segment Selector Demo */}
                <section className={styles.demoSection}>
                    <h2>SegmentSelector (Mode)</h2>
                    <p className={styles.description}>
                        Exclusive choice with backlit active segment
                    </p>
                    <div className={styles.controlWrapper}>
                        <div className={styles.placeholder}>
                            <div className={styles.segmentSelector}>
                                {['standard', 't-mode', 'predict', 'perps'].map(mode => (
                                    <button
                                        key={mode}
                                        className={`${styles.segment} ${modeValue === mode ? styles.segmentActive : ''}`}
                                        onClick={() => setModeValue(mode)}
                                    >
                                        {mode.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>{modeValue}</code>
                    </div>
                </section>

                {/* Tag Input Demo */}
                <section className={styles.demoSection}>
                    <h2>TagInput (Token List)</h2>
                    <p className={styles.description}>
                        Multi-value text entry with chips
                    </p>
                    <div className={styles.controlWrapper}>
                        <div className={styles.placeholder}>
                            <div className={styles.tagInput}>
                                <div className={styles.tagList}>
                                    {tags.map(tag => (
                                        <span key={tag} className={styles.tag}>
                                            {tag}
                                            <button onClick={() => setTags(t => t.filter(x => x !== tag))}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add token..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            const value = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                            if (value && !tags.includes(value)) {
                                                setTags(t => [...t, value]);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className={styles.label}>Token Blacklist</div>
                        </div>
                    </div>
                    <div className={styles.stateDisplay}>
                        Current: <code>[{tags.join(', ')}]</code>
                    </div>
                </section>

                {/* Collapsible Section Demo */}
                <section className={styles.demoSection}>
                    <h2>CollapsibleSection</h2>
                    <p className={styles.description}>
                        Expandable container with help button
                    </p>
                    <div className={styles.controlWrapper}>
                        <div className={styles.placeholder}>
                            <div className={styles.collapsibleSection}>
                                <div
                                    className={styles.collapsibleHeader}
                                    onClick={() => setSectionExpanded(v => !v)}
                                >
                                    <span>{sectionExpanded ? '▼' : '▶'}</span>
                                    <span>BUY CONFIGURATION</span>
                                    <button
                                        className={styles.helpBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            alert('Help modal would open here');
                                        }}
                                    >?</button>
                                </div>
                                {sectionExpanded && (
                                    <div className={styles.collapsibleContent}>
                                        <p>Settings controls would go here...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.stateDisplay}>
                        Expanded: <code>{sectionExpanded ? 'true' : 'false'}</code>
                    </div>
                </section>
            </div>

            <footer className={styles.footer}>
                <p>These are placeholder implementations. Real controls will be built with proper circular drag gestures, react-spring animations, and copper/bronze styling.</p>
            </footer>
        </div>
    );
}
