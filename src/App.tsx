import { useState, useCallback, useRef, useEffect } from 'react';

type SoundType = 'wooden' | 'glass' | 'metal' | 'stone' | 'bell' | 'none';
type ThemeMode = 'dark' | 'light';

interface LapRecord {
  lap: number;
  target: number;
  timestamp: Date;
}

// Flutter WebView communication interface
declare global {
  interface Window {
    FlutterWebView?: {
      postMessage: (message: string) => void;
    };
    flutter_inappwebview?: {
      callHandler: (handlerName: string, ...args: any[]) => void;
    };
    // For webview_flutter (official Flutter plugin)
    _FlutterWebViewBridge?: (message: string) => void;
  }
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

const THEMES = {
  dark: {
    bg1: '#00160D', bg2: '#003D2B', bg3: '#005A3C',
    gold: '#D4AF37', goldLight: '#F5E6A3',
    goldDim: 'rgba(212, 175, 55, 0.15)', goldBorder: 'rgba(212, 175, 55, 0.4)',
    text: '#ffffff', textMuted: 'rgba(134, 239, 172, 0.6)', textDim: 'rgba(134, 239, 172, 0.4)',
    cardBg: 'rgba(0, 61, 43, 0.5)', cardBorder: 'rgba(212, 175, 55, 0.2)',
    modalBg: 'linear-gradient(180deg, #003D2B, #00160D)',
    ringTrack: '#003D2B',
    buttonBg: 'radial-gradient(circle at 30% 30%, #005A3C, #003D2B, #00160D)',
    shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.6)',
    progressGlow: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))',
    textGlow: '0 0 20px rgba(212, 175, 55, 0.3)',
  },
  light: {
    bg1: '#f0f7f4', bg2: '#d4edda', bg3: '#b8e0c8',
    gold: '#8B6914', goldLight: '#C49B2A',
    goldDim: 'rgba(139, 105, 20, 0.1)', goldBorder: 'rgba(139, 105, 20, 0.4)',
    text: '#1a1a1a', textMuted: 'rgba(0, 61, 43, 0.7)', textDim: 'rgba(0, 61, 43, 0.5)',
    cardBg: 'rgba(255, 255, 255, 0.85)', cardBorder: 'rgba(139, 105, 20, 0.25)',
    modalBg: 'linear-gradient(180deg, #ffffff, #f0f7f4)',
    ringTrack: '#d4edda',
    buttonBg: 'radial-gradient(circle at 30% 30%, #b8e0c8, #d4edda, #f0f7f4)',
    shadow: 'rgba(0,0,0,0.12)', overlay: 'rgba(0,0,0,0.35)',
    progressGlow: 'drop-shadow(0 0 6px rgba(139, 105, 20, 0.3))',
    textGlow: 'none',
  },
};

// Flutter WebView bridge helper
function sendToFlutter(type: string, data: Record<string, any> = {}) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  
  // webview_flutter (official Flutter plugin)
  if (window.FlutterWebView?.postMessage) {
    window.FlutterWebView.postMessage(message);
  }
  // flutter_inappwebview
  if (window.flutter_inappwebview?.callHandler) {
    window.flutter_inappwebview.callHandler('TasbeehEvent', message);
  }
  // Custom bridge
  if (window._FlutterWebViewBridge) {
    window._FlutterWebViewBridge(message);
  }
  // postMessage fallback for iframe embedding
  try {
    window.parent?.postMessage({ channel: 'tasbeeh', ...JSON.parse(message) }, '*');
  } catch (_) {}
}

// Detect if running inside Flutter WebView
function isFlutterWebView(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return !!(
    window.FlutterWebView ||
    window.flutter_inappwebview ||
    window._FlutterWebViewBridge ||
    ua.includes('flutter') ||
    // Check for common Flutter WebView indicators
    (window as any).__flutter_bridge ||
    (window as any).webkit?.messageHandlers?.flutterWebView
  );
}

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
  const [inFlutter, setInFlutter] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('sm');
  const [isLandscape, setIsLandscape] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const t = THEMES[theme];

  // Detect Flutter WebView environment
  useEffect(() => {
    const flutterDetected = isFlutterWebView();
    setInFlutter(flutterDetected);
    if (flutterDetected) {
      sendToFlutter('appReady', { theme, count, target });
    }
  }, []);

  // Save theme & notify Flutter
  useEffect(() => {
    localStorage.setItem('tasbeeh-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    sendToFlutter('themeChanged', { theme });
  }, [theme]);

  // Responsive layout detection
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

    // Listen for messages from Flutter
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.channel === 'flutter-tasbeeh') {
        const { action, payload } = event.data;
        switch (action) {
          case 'setTheme':
            if (payload === 'light' || payload === 'dark') setTheme(payload);
            break;
          case 'reset':
            handleReset();
            break;
          case 'getState':
            sendToFlutter('state', { count, target, currentLap, laps: laps.length, totalAllTime, theme });
            break;
        }
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
      window.removeEventListener('message', handleMessage);
    };
  }, [count, target, currentLap, laps.length, totalAllTime, theme]);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (_) {
      // Audio not available in some WebView contexts
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (type === 'none') return;
    const ctx = getAudioContext();
    if (!ctx) return; // Audio unavailable (some Flutter WebView configs)
    const now = ctx.currentTime;

    try {
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
    } catch (_) {
      // Sound playback failed - continue silently
    }
  }, [getAudioContext]);

  // Haptic feedback - works in Flutter WebView via native bridge
  const triggerHaptic = useCallback(() => {
    // Try native haptic first
    if (navigator.vibrate) {
      try { navigator.vibrate(30); } catch (_) {}
    }
    // Notify Flutter to trigger native haptic
    sendToFlutter('haptic', { type: 'light', duration: 30 });
  }, []);

  const handleCount = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setTotalAllTime(prev => prev + 1);
    playSound(soundType);
    triggerHaptic();

    // Notify Flutter of count change
    sendToFlutter('count', { count: newCount, target, totalAllTime: totalAllTime + 1 });

    if (newCount >= target) {
      setLaps(prev => [...prev, { lap: currentLap, target, timestamp: new Date() }]);
      setCurrentLap(prev => prev + 1);
      setCount(0);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      
      // Strong haptic for lap completion
      if (navigator.vibrate) {
        try { navigator.vibrate([100, 50, 100, 50, 200]); } catch (_) {}
      }
      sendToFlutter('lapComplete', { lap: currentLap, target });
      sendToFlutter('haptic', { type: 'heavy', pattern: [100, 50, 100, 50, 200] });
    }
  }, [count, target, currentLap, soundType, totalAllTime, playSound, triggerHaptic]);

  const handleReset = useCallback(() => {
    setCount(0);
    setCurrentLap(1);
    setLaps([]);
    sendToFlutter('reset', {});
  }, []);

  const progress = target > 0 ? (count / target) * 100 : 0;

  // Keyboard support (desktop Flutter)
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

  // Responsive sizing
  const getRingSize = () => {
    if (screenSize === 'xs') return 'min(52vw, 45vh, 200px)';
    if (screenSize === 'sm') return 'min(58vw, 42vh, 250px)';
    if (screenSize === 'md') return 'min(42vw, 40vh, 290px)';
    if (screenSize === 'lg') return 'min(32vw, 38vh, 310px)';
    return 'min(28vw, 32vh, 340px)';
  };

  const getButtonSize = () => {
    if (screenSize === 'xs') return 'min(36vw, 32vh, 140px)';
    if (screenSize === 'sm') return 'min(40vw, 30vh, 165px)';
    if (screenSize === 'md') return 'min(28vw, 26vh, 185px)';
    if (screenSize === 'lg') return 'min(20vw, 22vh, 195px)';
    return 'min(16vw, 18vh, 205px)';
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isSmall = screenSize === 'xs';

  return (
    <div
      className="w-full min-h-[100dvh] flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${t.bg1} 0%, ${t.bg2} 40%, ${t.bg3} 100%)`,
        color: t.text,
        transition: 'background 0.4s ease, color 0.4s ease',
        minHeight: '100dvh',
        height: '100dvh',
      }}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        opacity: 0.03,
        backgroundImage: `radial-gradient(circle, ${t.gold} 1px, transparent 1px)`,
        backgroundSize: isSmall ? '28px 28px' : '48px 48px',
      }} />

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div style={{ fontSize: isSmall ? '2.5rem' : '3.5rem' }}>✨</div>
            <div className="font-bold mt-2" style={{ color: t.gold, fontSize: isSmall ? '1.2rem' : '1.8rem' }}>
              Target Complete!
            </div>
            <div className="mt-1" style={{ color: t.textMuted, fontSize: isSmall ? '0.8rem' : '1rem' }}>
              Lap {currentLap - 1} of {target}x ✓
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: `${isSmall ? '0.5rem' : '0.75rem'} ${isSmall ? '0.75rem' : '1.25rem'}`,
          paddingTop: `max(${isSmall ? '0.5rem' : '0.75rem'}, env(safe-area-inset-top))`,
        }}
      >
        <div className="text-center flex-1">
          <h1 className="font-bold" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.35rem' }}>
            بِسْمِ اللَّهِ
          </h1>
          <p style={{ color: t.textDim, fontSize: isSmall ? '0.55rem' : '0.7rem' }}>
            Digital Tasbeeh Counter {inFlutter && '• Flutter'}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            width: isSmall ? '34px' : '40px',
            height: isSmall ? '34px' : '40px',
            backgroundColor: t.goldDim,
            border: `1.5px solid ${t.goldBorder}`,
          }}
          aria-label="Toggle theme"
        >
          <span style={{ fontSize: isSmall ? '0.95rem' : '1.15rem' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>
      </header>

      {/* Target Presets */}
      <div className="flex justify-center gap-1.5 sm:gap-2 flex-shrink-0" style={{ padding: '0.4rem 0.75rem' }}>
        {TARGET_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => { setTarget(preset); setCount(0); setCurrentLap(1); setLaps([]); sendToFlutter('targetChanged', { target: preset }); }}
            className="rounded-full font-semibold transition-all duration-200 active:scale-95"
            style={{
              padding: isSmall ? '0.25rem 0.6rem' : '0.35rem 0.9rem',
              fontSize: isSmall ? '0.65rem' : '0.8rem',
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

      {/* Main Content */}
      <main
        className={`flex-1 flex ${isLandscape && screenSize !== 'xl' ? 'flex-row' : 'flex-col'} items-center justify-center gap-2 sm:gap-4 px-3`}
        style={{ minHeight: 0 }}
      >
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
              style={{ filter: t.progressGlow }}
            />
          </svg>
          <div className="text-center z-10">
            <div className="font-bold tabular-nums" style={{
              color: t.gold,
              fontSize: isSmall ? '2rem' : screenSize === 'sm' ? '2.8rem' : '3.5rem',
              textShadow: t.textGlow,
              lineHeight: 1,
            }}>
              {count}
            </div>
            <div style={{ color: t.textMuted, fontSize: isSmall ? '0.65rem' : '0.85rem' }}>
              / {target}
            </div>
            <div style={{ color: t.textDim, fontSize: isSmall ? '0.55rem' : '0.7rem' }}>
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
            <div style={{ fontSize: isSmall ? '1.5rem' : screenSize === 'sm' ? '2rem' : '2.6rem' }}>📿</div>
            <div className="font-bold" style={{ color: t.gold, fontSize: isSmall ? '0.6rem' : '0.8rem' }}>
              TAP
            </div>
          </div>
        </button>
      </main>

      {/* Stats Bar */}
      <div
        className="flex justify-between items-center rounded-2xl mx-auto flex-shrink-0"
        style={{
          width: 'min(92%, 400px)',
          padding: isSmall ? '0.4rem 0.5rem' : '0.55rem 1rem',
          backgroundColor: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          margin: '0.4rem auto',
        }}
      >
        {[
          { value: currentLap, label: 'Lap' },
          { value: laps.length, label: 'Done' },
          { value: totalAllTime, label: 'Total' },
        ].map((stat, i) => (
          <div key={i} className="text-center flex-1" style={i < 2 ? { borderRight: `1px solid ${t.cardBorder}` } : {}}>
            <div className="font-bold" style={{ color: t.gold, fontSize: isSmall ? '0.8rem' : '1.05rem' }}>
              {stat.value}
            </div>
            <div style={{ color: t.textMuted, fontSize: isSmall ? '0.45rem' : '0.65rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div
        className="flex justify-center gap-3 flex-shrink-0"
        style={{
          padding: '0.6rem 0.75rem',
          paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))',
        }}
      >
        {[
          { icon: '⚙️', action: () => setShowSettings(true), label: 'Sound' },
          { icon: '📋', action: () => setShowLaps(true), label: 'Laps' },
          { icon: '🔄', action: handleReset, label: 'Reset' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              width: isSmall ? '38px' : '46px',
              height: isSmall ? '38px' : '46px',
              backgroundColor: t.goldDim,
              border: `1.5px solid ${t.goldBorder}`,
            }}
            aria-label={btn.label}
          >
            <span style={{ fontSize: isSmall ? '0.95rem' : '1.2rem' }}>{btn.icon}</span>
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ padding: isSmall ? '0.75rem' : '1rem' }} onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: t.overlay }} />
          <div
            className="relative z-10 w-full rounded-3xl overflow-y-auto"
            style={{
              maxWidth: 'min(92vw, 400px)',
              maxHeight: '80dvh',
              background: t.modalBg,
              border: `2px solid ${t.goldBorder}`,
              boxShadow: `0 20px 60px ${t.shadow}`,
              padding: isSmall ? '0.9rem' : '1.3rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
              🔊 Sound Settings
            </h2>
            <div className="space-y-1.5">
              {SOUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setSoundType(option.value); if (option.value !== 'none') playSound(option.value); }}
                  className="w-full flex items-center gap-2.5 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    padding: isSmall ? '0.45rem 0.6rem' : '0.6rem 0.9rem',
                    backgroundColor: soundType === option.value ? `${t.gold}22` : t.cardBg,
                    border: soundType === option.value ? `2px solid ${t.gold}` : `1px solid ${t.cardBorder}`,
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{option.icon}</span>
                  <span className="font-medium flex-1 text-left" style={{
                    color: soundType === option.value ? t.gold : t.textMuted,
                    fontSize: isSmall ? '0.7rem' : '0.82rem',
                  }}>
                    {option.label}
                  </span>
                  {soundType === option.value && (
                    <span className="px-1.5 py-0.5 rounded-full font-semibold" style={{
                      backgroundColor: t.gold, color: t.bg1, fontSize: '0.6rem',
                    }}>
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-3 py-2 rounded-xl font-semibold transition-all active:scale-[0.98]"
              style={{ backgroundColor: t.gold, color: t.bg1, fontSize: isSmall ? '0.8rem' : '0.9rem' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Laps Modal */}
      {showLaps && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ padding: isSmall ? '0.75rem' : '1rem' }} onClick={() => setShowLaps(false)}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: t.overlay }} />
          <div
            className="relative z-10 w-full rounded-3xl overflow-y-auto"
            style={{
              maxWidth: 'min(92vw, 400px)',
              maxHeight: '80dvh',
              background: t.modalBg,
              border: `2px solid ${t.goldBorder}`,
              boxShadow: `0 20px 60px ${t.shadow}`,
              padding: isSmall ? '0.9rem' : '1.3rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
              📋 Lap History
            </h2>
            {laps.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '2rem' }} className="mb-2">📿</div>
                <p style={{ color: t.textMuted, fontSize: isSmall ? '0.7rem' : '0.82rem' }}>
                  No completed laps yet
                </p>
                <p style={{ color: t.textDim, fontSize: isSmall ? '0.6rem' : '0.7rem' }} className="mt-1">
                  Complete {target} counts to record a lap
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {[...laps].reverse().map((lap, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl"
                    style={{
                      padding: isSmall ? '0.45rem 0.6rem' : '0.6rem 0.9rem',
                      backgroundColor: t.cardBg,
                      border: `1px solid ${t.cardBorder}`,
                    }}>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{
                          width: isSmall ? '24px' : '30px',
                          height: isSmall ? '24px' : '30px',
                          backgroundColor: t.gold, color: t.bg1,
                          fontSize: isSmall ? '0.55rem' : '0.7rem',
                        }}>
                        {lap.lap}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: t.gold, fontSize: isSmall ? '0.65rem' : '0.8rem' }}>
                          {lap.target}x completed
                        </div>
                        <div style={{ color: t.textDim, fontSize: isSmall ? '0.5rem' : '0.65rem' }}>
                          {lap.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: t.gold, fontSize: '0.9rem' }}>✓</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLaps(false)}
              className="w-full mt-3 py-2 rounded-xl font-semibold transition-all active:scale-[0.98]"
              style={{ backgroundColor: t.gold, color: t.bg1, fontSize: isSmall ? '0.8rem' : '0.9rem' }}
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
