import { useState, useCallback, useRef, useEffect } from 'react';

type SoundType = 'wooden' | 'glass' | 'metal' | 'stone' | 'bell' | 'none';
type ThemeMode = 'dark' | 'light';

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

// Theme color definitions
const THEMES = {
  dark: {
    bg1: '#00160D',
    bg2: '#003D2B',
    bg3: '#005A3C',
    gold: '#D4AF37',
    goldLight: '#F5E6A3',
    goldDim: 'rgba(212, 175, 55, 0.15)',
    goldBorder: 'rgba(212, 175, 55, 0.4)',
    text: '#ffffff',
    textMuted: 'rgba(134, 239, 172, 0.6)',
    textDim: 'rgba(134, 239, 172, 0.4)',
    cardBg: 'rgba(0, 61, 43, 0.5)',
    cardBorder: 'rgba(212, 175, 55, 0.2)',
    modalBg: 'linear-gradient(180deg, #003D2B, #00160D)',
    ringTrack: '#003D2B',
    buttonBg: 'radial-gradient(circle at 30% 30%, #005A3C, #003D2B, #00160D)',
    shadow: 'rgba(0,0,0,0.4)',
    overlay: 'rgba(0,0,0,0.6)',
  },
  light: {
    bg1: '#f0f7f4',
    bg2: '#d4edda',
    bg3: '#b8e0c8',
    gold: '#8B6914',
    goldLight: '#C49B2A',
    goldDim: 'rgba(139, 105, 20, 0.1)',
    goldBorder: 'rgba(139, 105, 20, 0.4)',
    text: '#1a1a1a',
    textMuted: 'rgba(0, 61, 43, 0.7)',
    textDim: 'rgba(0, 61, 43, 0.5)',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardBorder: 'rgba(139, 105, 20, 0.25)',
    modalBg: 'linear-gradient(180deg, #ffffff, #f0f7f4)',
    ringTrack: '#d4edda',
    buttonBg: 'radial-gradient(circle at 30% 30%, #b8e0c8, #d4edda, #f0f7f4)',
    shadow: 'rgba(0,0,0,0.1)',
    overlay: 'rgba(0,0,0,0.3)',
  },
};

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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tasbeeh-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const t = THEMES[theme];

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('tasbeeh-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Detect orientation
  const [isLandscape, setIsLandscape] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('sm');

  useEffect(() => {
    const updateLayout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscape(w > h);
      if (w < 360) setScreenSize('xs');
      else if (w < 640) setScreenSize('sm');
      else if (w < 1024) setScreenSize('md');
      else if (w < 1440) setScreenSize('lg');
      else setScreenSize('xl');
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (type === 'none') return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'wooden': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 800; filter.Q.value = 2;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.1);
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
        osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc1.start(now); osc2.start(now); osc1.stop(now + 0.2); osc2.stop(now + 0.2);
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
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
        break;
      }
      case 'stone': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 400;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
        break;
      }
      case 'bell': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine'; osc1.frequency.value = 800;
        osc2.type = 'sine'; osc2.frequency.value = 1200;
        osc3.type = 'sine'; osc3.frequency.value = 1600;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain); osc2.connect(gain); osc3.connect(gain); gain.connect(ctx.destination);
        osc1.start(now); osc2.start(now); osc3.start(now);
        osc1.stop(now + 0.5); osc2.stop(now + 0.5); osc3.stop(now + 0.5);
        break;
      }
    }
  }, [getAudioContext]);

  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(30);
  }, []);

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
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, [count, target, currentLap, soundType, playSound, triggerHaptic]);

  const handleReset = useCallback(() => {
    setCount(0);
    setCurrentLap(1);
    setLaps([]);
  }, []);

  const progress = (count / target) * 100;

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

  // Responsive sizing helper
  const getRingSize = () => {
    if (screenSize === 'xs') return 'min(55vw, 55vh, 220px)';
    if (screenSize === 'sm') return 'min(60vw, 50vh, 260px)';
    if (screenSize === 'md') return 'min(45vw, 45vh, 300px)';
    if (screenSize === 'lg') return 'min(35vw, 40vh, 320px)';
    return 'min(30vw, 35vh, 350px)';
  };

  const getButtonSize = () => {
    if (screenSize === 'xs') return 'min(38vw, 38vh, 150px)';
    if (screenSize === 'sm') return 'min(42vw, 35vh, 175px)';
    if (screenSize === 'md') return 'min(30vw, 30vh, 190px)';
    if (screenSize === 'lg') return 'min(22vw, 25vh, 200px)';
    return 'min(18vw, 20vh, 210px)';
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className="w-full min-h-[100dvh] flex flex-col overflow-x-hidden"
      style={{
        background: `linear-gradient(160deg, ${t.bg1} 0%, ${t.bg2} 40%, ${t.bg3} 100%)`,
        color: t.text,
        transition: 'background 0.4s ease, color 0.4s ease',
      }}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle, ${t.gold} 1px, transparent 1px)`,
        backgroundSize: screenSize === 'xs' ? '30px 30px' : '50px 50px',
      }} />

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div className={screenSize === 'xs' ? 'text-4xl' : 'text-6xl'}>✨</div>
            <div className="font-bold mt-2" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '1.3rem' : '2rem' }}>
              Target Complete!
            </div>
            <div className="mt-1" style={{ color: t.textMuted, fontSize: screenSize === 'xs' ? '0.85rem' : '1.1rem' }}>
              Lap {currentLap - 1} of {target}x ✓
            </div>
          </div>
        </div>
      )}

      {/* Top Bar - Theme Toggle & Bismillah */}
      <header className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-1 flex-shrink-0"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="text-center flex-1">
          <h1 className="font-bold" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '1rem' : '1.4rem' }}>
            بِسْمِ اللَّهِ
          </h1>
          <p style={{ color: t.textDim, fontSize: screenSize === 'xs' ? '0.6rem' : '0.75rem' }}>
            Digital Tasbeeh Counter
          </p>
        </div>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 ml-2"
          style={{
            width: screenSize === 'xs' ? '36px' : '42px',
            height: screenSize === 'xs' ? '36px' : '42px',
            backgroundColor: t.goldDim,
            border: `1.5px solid ${t.goldBorder}`,
          }}
          aria-label="Toggle theme"
        >
          <span style={{ fontSize: screenSize === 'xs' ? '1rem' : '1.2rem' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>
      </header>

      {/* Target Presets */}
      <div className="flex justify-center gap-1.5 sm:gap-2 px-3 py-2 flex-shrink-0">
        {TARGET_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => { setTarget(preset); setCount(0); setCurrentLap(1); setLaps([]); }}
            className="rounded-full font-semibold transition-all duration-200"
            style={{
              padding: screenSize === 'xs' ? '0.3rem 0.7rem' : '0.4rem 1rem',
              fontSize: screenSize === 'xs' ? '0.7rem' : '0.85rem',
              backgroundColor: target === preset ? t.gold : 'transparent',
              color: target === preset ? t.bg1 : t.gold,
              border: `1.5px solid ${t.gold}`,
              transform: target === preset ? 'scale(1.05)' : 'scale(1)',
              boxShadow: target === preset ? `0 0 12px ${t.goldDim}` : 'none',
            }}
          >
            {preset}x
          </button>
        ))}
      </div>

      {/* Main Content - Flex to fill available space */}
      <main className={`flex-1 flex ${isLandscape && screenSize !== 'xl' ? 'flex-row' : 'flex-col'} items-center justify-center gap-3 sm:gap-5 px-3 sm:px-5`}>
        
        {/* Progress Ring */}
        <div
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ width: getRingSize(), height: getRingSize() }}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="116" fill="none" stroke={t.ringTrack} strokeWidth="8" />
            <circle
              cx="128" cy="128" r="116" fill="none" stroke={t.gold} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 116}`}
              strokeDashoffset={`${2 * Math.PI * 116 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-200"
              style={{ filter: `drop-shadow(0 0 8px ${t.goldDim})` }}
            />
          </svg>
          <div className="text-center z-10">
            <div className="font-bold tabular-nums" style={{
              color: t.gold,
              fontSize: screenSize === 'xs' ? '2.2rem' : screenSize === 'sm' ? '3rem' : '3.8rem',
              textShadow: theme === 'dark' ? `0 0 20px ${t.goldDim}` : 'none',
              lineHeight: 1,
            }}>
              {count}
            </div>
            <div style={{ color: t.textMuted, fontSize: screenSize === 'xs' ? '0.7rem' : '0.9rem' }}>
              / {target}
            </div>
            <div style={{ color: t.textDim, fontSize: screenSize === 'xs' ? '0.6rem' : '0.75rem' }}>
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
          className="rounded-full flex items-center justify-center select-none flex-shrink-0"
          style={{
            width: getButtonSize(),
            height: getButtonSize(),
            background: t.buttonBg,
            boxShadow: isPressed
              ? `inset 0 4px 15px ${t.shadow}, 0 0 20px ${t.goldDim}`
              : `0 8px 30px ${t.shadow}, 0 0 30px ${t.goldDim}, inset 0 -3px 8px ${t.shadow}`,
            border: `3px solid ${t.gold}`,
            transform: isPressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
        >
          <div className="text-center">
            <div style={{ fontSize: screenSize === 'xs' ? '1.6rem' : screenSize === 'sm' ? '2.2rem' : '2.8rem' }}>📿</div>
            <div className="font-bold" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '0.65rem' : '0.85rem' }}>
              TAP
            </div>
          </div>
        </button>
      </main>

      {/* Stats Bar */}
      <div
        className="flex justify-between items-center rounded-2xl mx-auto flex-shrink-0"
        style={{
          width: 'min(90%, 420px)',
          padding: screenSize === 'xs' ? '0.5rem 0.6rem' : '0.6rem 1.2rem',
          backgroundColor: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          marginTop: '0.5rem',
          backdropFilter: 'blur(10px)',
        }}
      >
        {[
          { value: currentLap, label: 'Lap' },
          { value: laps.length, label: 'Done' },
          { value: totalAllTime, label: 'Total' },
        ].map((stat, i) => (
          <div key={i} className="text-center flex-1" style={i < 2 ? { borderRight: `1px solid ${t.cardBorder}` } : {}}>
            <div className="font-bold" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '0.85rem' : '1.1rem' }}>
              {stat.value}
            </div>
            <div style={{ color: t.textMuted, fontSize: screenSize === 'xs' ? '0.5rem' : '0.7rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center gap-3 sm:gap-4 py-3 flex-shrink-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {[
          { icon: '⚙️', action: () => setShowSettings(true), label: 'Settings' },
          { icon: '📋', action: () => setShowLaps(true), label: 'Laps' },
          { icon: '🔄', action: handleReset, label: 'Reset' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              width: screenSize === 'xs' ? '40px' : '48px',
              height: screenSize === 'xs' ? '40px' : '48px',
              backgroundColor: t.goldDim,
              border: `1.5px solid ${t.goldBorder}`,
            }}
            aria-label={btn.label}
          >
            <span style={{ fontSize: screenSize === 'xs' ? '1rem' : '1.25rem' }}>{btn.icon}</span>
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: t.overlay }} />
          <div
            className="relative z-10 w-full rounded-3xl overflow-y-auto"
            style={{
              maxWidth: 'min(92vw, 420px)',
              maxHeight: '85dvh',
              background: t.modalBg,
              border: `2px solid ${t.goldBorder}`,
              boxShadow: `0 20px 60px ${t.shadow}`,
              padding: screenSize === 'xs' ? '1rem' : '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-center mb-4" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '1.1rem' : '1.3rem' }}>
              🔊 Sound Settings
            </h2>
            <div className="space-y-2">
              {SOUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setSoundType(option.value); if (option.value !== 'none') playSound(option.value); }}
                  className="w-full flex items-center gap-3 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    padding: screenSize === 'xs' ? '0.5rem 0.7rem' : '0.65rem 1rem',
                    backgroundColor: soundType === option.value ? `${t.gold}22` : t.cardBg,
                    border: soundType === option.value ? `2px solid ${t.gold}` : `1px solid ${t.cardBorder}`,
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{option.icon}</span>
                  <span className="font-medium flex-1 text-left" style={{
                    color: soundType === option.value ? t.gold : t.textMuted,
                    fontSize: screenSize === 'xs' ? '0.75rem' : '0.875rem',
                  }}>
                    {option.label}
                  </span>
                  {soundType === option.value && (
                    <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                      backgroundColor: t.gold, color: t.bg1, fontSize: '0.65rem',
                    }}>
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-4 py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
              style={{ backgroundColor: t.gold, color: t.bg1, fontSize: screenSize === 'xs' ? '0.85rem' : '0.95rem' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Laps Modal */}
      {showLaps && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4" onClick={() => setShowLaps(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: t.overlay }} />
          <div
            className="relative z-10 w-full rounded-3xl overflow-y-auto"
            style={{
              maxWidth: 'min(92vw, 420px)',
              maxHeight: '85dvh',
              background: t.modalBg,
              border: `2px solid ${t.goldBorder}`,
              boxShadow: `0 20px 60px ${t.shadow}`,
              padding: screenSize === 'xs' ? '1rem' : '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-center mb-4" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '1.1rem' : '1.3rem' }}>
              📋 Lap History
            </h2>
            {laps.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">📿</div>
                <p style={{ color: t.textMuted, fontSize: screenSize === 'xs' ? '0.75rem' : '0.875rem' }}>
                  No completed laps yet
                </p>
                <p style={{ color: t.textDim, fontSize: screenSize === 'xs' ? '0.65rem' : '0.75rem' }} className="mt-1">
                  Complete {target} counts to record a lap
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...laps].reverse().map((lap, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl"
                    style={{
                      padding: screenSize === 'xs' ? '0.5rem 0.7rem' : '0.65rem 1rem',
                      backgroundColor: t.cardBg,
                      border: `1px solid ${t.cardBorder}`,
                    }}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{
                          width: screenSize === 'xs' ? '26px' : '32px',
                          height: screenSize === 'xs' ? '26px' : '32px',
                          backgroundColor: t.gold, color: t.bg1,
                          fontSize: screenSize === 'xs' ? '0.6rem' : '0.75rem',
                        }}>
                        {lap.lap}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: t.gold, fontSize: screenSize === 'xs' ? '0.7rem' : '0.85rem' }}>
                          {lap.target}x completed
                        </div>
                        <div style={{ color: t.textDim, fontSize: screenSize === 'xs' ? '0.55rem' : '0.7rem' }}>
                          {lap.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-green-400" style={{ fontSize: '1rem' }}>✓</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLaps(false)}
              className="w-full mt-4 py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
              style={{ backgroundColor: t.gold, color: t.bg1, fontSize: screenSize === 'xs' ? '0.85rem' : '0.95rem' }}
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
