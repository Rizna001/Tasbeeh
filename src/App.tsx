import { useState, useCallback, useRef, useEffect } from 'react';

// Sound types for the synthesized bead sounds
type SoundType = 'wooden' | 'glass' | 'metal' | 'stone' | 'bell' | 'none';

interface LapRecord {
  lap: number;
  target: number;
  timestamp: Date;
}

const TARGET_PRESETS = [33, 100, 1000];
const SOUND_OPTIONS: { value: SoundType; label: string; icon: string }[] = [
  { value: 'wooden', label: 'Wooden Bead', icon: '🪵' },
  { value: 'glass', label: 'Glass Bead', icon: '🔮' },
  { value: 'metal', label: 'Metal Click', icon: '🔔' },
  { value: 'stone', label: 'Stone Drop', icon: '🪨' },
  { value: 'bell', label: 'Temple Bell', icon: '🛕' },
  { value: 'none', label: 'Silent', icon: '🔇' },
];

function App() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [currentLap, setCurrentLap] = useState(1);
  const [soundType, setSoundType] = useState<SoundType>('wooden');
  const [showSettings, setShowSettings] = useState(false);
  const [showLaps, setShowLaps] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [totalAllTime, setTotalAllTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Detect orientation for layout adaptation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 900);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Synthesize different bead sounds
  const playSound = useCallback((type: SoundType) => {
    if (type === 'none') return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'wooden': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'glass': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2000, now);
        osc1.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(3000, now);
        osc2.frequency.exponentialRampToValueAtTime(2500, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
        break;
      }
      case 'metal': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(3000, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'stone': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'bell': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 800;
        osc2.type = 'sine';
        osc2.frequency.value = 1200;
        osc3.type = 'sine';
        osc3.frequency.value = 1600;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        osc3.stop(now + 0.5);
        break;
      }
    }
  }, [getAudioContext]);

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);

  // Handle count increment
  const handleCount = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setTotalAllTime(prev => prev + 1);
    playSound(soundType);
    triggerHaptic();

    if (newCount >= target) {
      setLaps(prev => [...prev, { lap: currentLap, target, timestamp: new Date() }]);
      setCurrentLap(prev => prev + 1);
      setCount(0);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [count, target, currentLap, soundType, playSound, triggerHaptic]);

  // Reset counter
  const handleReset = useCallback(() => {
    setCount(0);
    setCurrentLap(1);
    setLaps([]);
  }, []);

  // Progress percentage
  const progress = (count / target) * 100;

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleCount();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCount]);

  return (
    <div
      className="w-full overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #00160D 0%, #003D2B 50%, #005A3C 100%)',
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #D4AF37 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #D4AF37 1px, transparent 1px)`,
          backgroundSize: 'clamp(40px, 8vw, 60px) clamp(40px, 8vw, 60px)'
        }}></div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-5xl sm:text-6xl md:text-7xl mb-3">✨</div>
            <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#D4AF37' }}>
              Target Complete!
            </div>
            <div className="text-base sm:text-lg text-green-200 mt-2">
              Lap {currentLap - 1} of {target}x ✓
            </div>
          </div>
        </div>
      )}

      {/* Main Counter Container - Responsive Layout */}
      <div className={`relative z-10 w-full mx-auto flex flex-col
        ${isLandscape ? 'flex-row items-center max-w-5xl px-4 sm:px-6 py-2' : 'px-4 sm:px-6 py-4 sm:py-6'}
        ${isLandscape ? 'h-[100dvh]' : 'min-h-[100dvh]'}`}
      >
        
        {/* Header */}
        <div className={`text-center ${isLandscape ? 'mb-2 flex-shrink-0' : 'mb-2 sm:mb-4'}`}>
          <h1
            className="font-bold tracking-wide"
            style={{
              color: '#D4AF37',
              fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
            }}
          >
            بِسْمِ اللَّهِ
          </h1>
          <p
            className="text-green-300/70 mt-0.5"
            style={{ fontSize: 'clamp(0.65rem, 2vw, 0.8rem)' }}
          >
            Digital Tasbeeh Counter
          </p>
        </div>

        {/* Target Presets */}
        <div className={`flex justify-center gap-1.5 sm:gap-2 ${isLandscape ? 'mb-2 flex-shrink-0' : 'mb-2 sm:mb-4'}`}>
          {TARGET_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { setTarget(preset); setCount(0); setCurrentLap(1); setLaps([]); }}
              className="rounded-full font-semibold transition-all duration-200 border"
              style={{
                padding: isLandscape ? '0.35rem 0.8rem' : 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 3vw, 1rem)',
                fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)',
                backgroundColor: target === preset ? '#D4AF37' : 'transparent',
                color: target === preset ? '#00160D' : '#D4AF37',
                borderColor: '#D4AF37',
                transform: target === preset ? 'scale(1.05)' : 'scale(1)',
                boxShadow: target === preset ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none',
              }}
            >
              {preset}x
            </button>
          ))}
        </div>

        {/* Main Content Area - adapts for landscape */}
        <div className={`flex-1 flex ${isLandscape ? 'flex-row items-center justify-center gap-4 sm:gap-8' : 'flex-col items-center justify-center'}`}>
          
          {/* Progress Ring + Counter */}
          <div className={`relative flex items-center justify-center ${isLandscape ? '' : 'mb-4 sm:mb-6'}`}
            style={{
              width: 'clamp(180px, 45vmin, 300px)',
              height: 'clamp(180px, 45vmin, 300px)',
            }}
          >
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128" cy="128" r="118"
                fill="none"
                stroke="#003D2B"
                strokeWidth="8"
              />
              <circle
                cx="128" cy="128" r="118"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 118}`}
                strokeDashoffset={`${2 * Math.PI * 118 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-200"
                style={{ filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))' }}
              />
            </svg>
            
            {/* Counter Display */}
            <div className="text-center z-10">
              <div
                className="font-bold tabular-nums"
                style={{
                  color: '#D4AF37',
                  fontSize: 'clamp(2.5rem, 10vmin, 4.5rem)',
                  textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                }}
              >
                {count}
              </div>
              <div
                className="text-green-300/70"
                style={{ fontSize: 'clamp(0.75rem, 2.5vmin, 1rem)' }}
              >
                / {target}
              </div>
              <div
                className="text-green-400/50"
                style={{ fontSize: 'clamp(0.65rem, 2vmin, 0.85rem)' }}
              >
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Count Button */}
          <button
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={(e) => { e.preventDefault(); setIsPressed(true); }}
            onTouchEnd={() => setIsPressed(false)}
            onClick={handleCount}
            className="rounded-full flex items-center justify-center transition-all duration-100 select-none active:scale-95 flex-shrink-0"
            style={{
              width: 'clamp(130px, 32vmin, 200px)',
              height: 'clamp(130px, 32vmin, 200px)',
              background: `radial-gradient(circle at 30% 30%, #005A3C, #003D2B, #00160D)`,
              boxShadow: isPressed
                ? 'inset 0 4px 12px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.2)'
                : '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(212, 175, 55, 0.1), inset 0 -4px 8px rgba(0,0,0,0.3)',
              border: '3px solid #D4AF37',
              transform: isPressed ? 'scale(0.93)' : 'scale(1)',
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: 'clamp(1.8rem, 6vmin, 2.8rem)' }}>📿</div>
              <div
                className="font-semibold"
                style={{
                  color: '#D4AF37',
                  fontSize: 'clamp(0.7rem, 2.5vmin, 1rem)',
                }}
              >
                TAP
              </div>
            </div>
          </button>
        </div>

        {/* Stats Bar */}
        <div
          className="flex justify-between items-center rounded-2xl mx-auto w-full"
          style={{
            maxWidth: 'clamp(280px, 80vw, 400px)',
            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1.5rem)',
            backgroundColor: 'rgba(0, 61, 43, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            marginTop: isLandscape ? '0.5rem' : '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          <div className="text-center flex-1">
            <div className="font-bold" style={{ color: '#D4AF37', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)' }}>{currentLap}</div>
            <div className="text-green-300/60" style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.75rem)' }}>Lap</div>
          </div>
          <div className="text-center flex-1 border-x border-green-800/50">
            <div className="font-bold" style={{ color: '#D4AF37', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)' }}>{laps.length}</div>
            <div className="text-green-300/60" style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.75rem)' }}>Completed</div>
          </div>
          <div className="text-center flex-1">
            <div className="font-bold" style={{ color: '#D4AF37', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)' }}>{totalAllTime}</div>
            <div className="text-green-300/60" style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.75rem)' }}>Total</div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center gap-3 sm:gap-4 pb-safe" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              width: 'clamp(40px, 10vw, 52px)',
              height: 'clamp(40px, 10vw, 52px)',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <span style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>⚙️</span>
          </button>
          <button
            onClick={() => setShowLaps(!showLaps)}
            className="rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              width: 'clamp(40px, 10vw, 52px)',
              height: 'clamp(40px, 10vw, 52px)',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <span style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>📋</span>
          </button>
          <button
            onClick={handleReset}
            className="rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              width: 'clamp(40px, 10vw, 52px)',
              height: 'clamp(40px, 10vw, 52px)',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
            }}
          >
            <span style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>🔄</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            className="relative z-50 w-full rounded-3xl p-4 sm:p-6 overflow-y-auto"
            style={{
              maxWidth: 'min(90vw, 400px)',
              maxHeight: '85dvh',
              background: 'linear-gradient(180deg, #003D2B, #00160D)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-xl font-bold text-center mb-4 sm:mb-6"
              style={{ color: '#D4AF37', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}
            >
              🔊 Sound Settings
            </h2>
            
            <div className="space-y-2 sm:space-y-3">
              {SOUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSoundType(option.value);
                    if (option.value !== 'none') playSound(option.value);
                  }}
                  className="w-full flex items-center gap-3 rounded-xl transition-all"
                  style={{
                    padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(0.8rem, 3vw, 1rem)',
                    backgroundColor: soundType === option.value ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 90, 60, 0.3)',
                    border: soundType === option.value ? '2px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.15)',
                    transform: soundType === option.value ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <span style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)' }}>{option.icon}</span>
                  <span
                    className="font-medium"
                    style={{
                      color: soundType === option.value ? '#D4AF37' : '#86efac',
                      fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                    }}
                  >
                    {option.label}
                  </span>
                  {soundType === option.value && (
                    <span
                      className="ml-auto px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: '#D4AF37',
                        color: '#00160D',
                        fontSize: 'clamp(0.6rem, 2vw, 0.7rem)',
                      }}
                    >
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-4 sm:mt-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#D4AF37',
                color: '#00160D',
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Laps Modal */}
      {showLaps && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowLaps(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            className="relative z-50 w-full rounded-3xl p-4 sm:p-6 overflow-y-auto"
            style={{
              maxWidth: 'min(90vw, 400px)',
              maxHeight: '85dvh',
              background: 'linear-gradient(180deg, #003D2B, #00160D)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-xl font-bold text-center mb-4 sm:mb-6"
              style={{ color: '#D4AF37', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}
            >
              📋 Lap History
            </h2>
            
            {laps.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div style={{ fontSize: 'clamp(2rem, 8vw, 2.8rem)' }} className="mb-3">📿</div>
                <p className="text-green-300/60" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)' }}>
                  No completed laps yet
                </p>
                <p className="text-green-300/40 mt-1" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.8rem)' }}>
                  Complete {target} counts to record a lap
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...laps].reverse().map((lap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl"
                    style={{
                      padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(0.8rem, 3vw, 1rem)',
                      backgroundColor: 'rgba(0, 90, 60, 0.3)',
                      border: '1px solid rgba(212, 175, 55, 0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{
                          width: 'clamp(28px, 7vw, 36px)',
                          height: 'clamp(28px, 7vw, 36px)',
                          backgroundColor: '#D4AF37',
                          color: '#00160D',
                          fontSize: 'clamp(0.65rem, 2vw, 0.8rem)',
                        }}
                      >
                        {lap.lap}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: '#D4AF37', fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)' }}>
                          {lap.target}x completed
                        </div>
                        <div className="text-green-300/50" style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.75rem)' }}>
                          {lap.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-green-400" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>✓</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLaps(false)}
              className="w-full mt-4 sm:mt-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#D4AF37',
                color: '#00160D',
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
