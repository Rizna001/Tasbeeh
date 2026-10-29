import { useState, useCallback, useRef, useEffect } from 'react';

type SoundType = 'wooden' | 'glass' | 'metal' | 'stone' | 'bell' | 'none';
type ThemeMode = 'dark' | 'light' | 'sepia';
type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface LapRecord {
  lap: number;
  target: number;
  timestamp: Date;
}

interface DhikrOption {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  defaultTarget: number;
}

const TARGET_PRESETS = [33, 99, 100, 300, 500, 1000, 10000];

const DHIKR_LIST: DhikrOption[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', meaning: 'Glory be to Allah', defaultTarget: 33 },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', meaning: 'All praise is due to Allah', defaultTarget: 33 },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', meaning: 'Allah is the Greatest', defaultTarget: 33 },
  { id: 'lailaha', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', meaning: 'There is no god but Allah', defaultTarget: 100 },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah', defaultTarget: 100 },
  { id: 'subhanwa', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'SubhanAllahi wa bihamdihi', meaning: 'Glory and praise be to Allah', defaultTarget: 100 },
  { id: 'salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد', transliteration: 'Allahumma salli ala Muhammad', meaning: 'O Allah, send blessings upon Muhammad', defaultTarget: 100 },
  { id: 'lahawla', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', meaning: 'There is no power except with Allah', defaultTarget: 100 },
  { id: 'none', arabic: '', transliteration: 'Nothing', meaning: 'No dhikr displayed', defaultTarget: 33 },
  { id: 'custom', arabic: '', transliteration: 'Custom', meaning: 'Enter your own text', defaultTarget: 33 },
];

const SOUND_OPTIONS: { value: SoundType; label: string; icon: string }[] = [
  { value: 'none', label: 'Silent', icon: '🔇' },
  { value: 'wooden', label: 'Wooden Bead', icon: '🪵' },
  { value: 'glass', label: 'Glass Bead', icon: '🔮' },
  { value: 'metal', label: 'Metal Click', icon: '🔔' },
  { value: 'stone', label: 'Stone Drop', icon: '🪨' },
  { value: 'bell', label: 'Temple Bell', icon: '🛕' },
];

const FONT_SIZES: { value: FontSize; label: string; preview: string }[] = [
  { value: 'small', label: 'Small', preview: 'Aa' },
  { value: 'medium', label: 'Medium', preview: 'Aa' },
  { value: 'large', label: 'Large', preview: 'Aa' },
  { value: 'xlarge', label: 'X-Large', preview: 'Aa' },
];

const THEMES = {
  dark: {
    bg1: '#00160D', bg2: '#003D2B', bg3: '#005A3C',
    gold: '#D4AF37', goldLight: '#F5E6A3', goldDark: '#A68A2A',
    goldDim: 'rgba(212, 175, 55, 0.12)', goldBorder: 'rgba(212, 175, 55, 0.35)',
    text: '#ffffff', textMuted: 'rgba(134, 239, 172, 0.65)', textDim: 'rgba(134, 239, 172, 0.4)',
    cardBg: 'rgba(0, 61, 43, 0.55)', cardBorder: 'rgba(212, 175, 55, 0.18)',
    modalBg: 'linear-gradient(180deg, #003D2B, #00160D)',
    ringTrack: 'rgba(0, 90, 60, 0.5)',
    buttonBg: 'radial-gradient(circle at 30% 30%, #005A3C, #003D2B, #00160D)',
    shadow: 'rgba(0,0,0,0.5)', overlay: 'rgba(0,0,0,0.65)',
    progressGlow: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))',
    textGlow: '0 0 30px rgba(212, 175, 55, 0.4), 0 2px 10px rgba(0,0,0,0.5)',
    accent: '#D4AF37', accentSoft: 'rgba(212, 175, 55, 0.2)',
    success: '#4ade80',
  },
  light: {
    bg1: '#f4faf7', bg2: '#d4edda', bg3: '#b8e0c8',
    gold: '#7A5A0A', goldLight: '#A68A2A', goldDark: '#5A4207',
    goldDim: 'rgba(122, 90, 10, 0.08)', goldBorder: 'rgba(122, 90, 10, 0.3)',
    text: '#1a2e1a', textMuted: 'rgba(0, 61, 43, 0.7)', textDim: 'rgba(0, 61, 43, 0.45)',
    cardBg: 'rgba(255, 255, 255, 0.85)', cardBorder: 'rgba(122, 90, 10, 0.2)',
    modalBg: 'linear-gradient(180deg, #ffffff, #f4faf7)',
    ringTrack: '#d4edda',
    buttonBg: 'radial-gradient(circle at 30% 30%, #b8e0c8, #d4edda, #f4faf7)',
    shadow: 'rgba(0,0,0,0.12)', overlay: 'rgba(0,0,0,0.35)',
    progressGlow: 'drop-shadow(0 0 6px rgba(122, 90, 10, 0.25))',
    textGlow: 'none',
    accent: '#7A5A0A', accentSoft: 'rgba(122, 90, 10, 0.12)',
    success: '#16a34a',
  },
  sepia: {
    bg1: '#2b1d0e', bg2: '#4a3420', bg3: '#6b4d30',
    gold: '#E8C56D', goldLight: '#F5E6A3', goldDark: '#B89A4A',
    goldDim: 'rgba(232, 197, 109, 0.12)', goldBorder: 'rgba(232, 197, 109, 0.35)',
    text: '#f5e6d3', textMuted: 'rgba(245, 230, 211, 0.7)', textDim: 'rgba(245, 230, 211, 0.45)',
    cardBg: 'rgba(74, 52, 32, 0.6)', cardBorder: 'rgba(232, 197, 109, 0.2)',
    modalBg: 'linear-gradient(180deg, #4a3420, #2b1d0e)',
    ringTrack: 'rgba(107, 77, 48, 0.6)',
    buttonBg: 'radial-gradient(circle at 30% 30%, #6b4d30, #4a3420, #2b1d0e)',
    shadow: 'rgba(0,0,0,0.5)', overlay: 'rgba(0,0,0,0.65)',
    progressGlow: 'drop-shadow(0 0 10px rgba(232, 197, 109, 0.4))',
    textGlow: '0 0 30px rgba(232, 197, 109, 0.3)',
    accent: '#E8C56D', accentSoft: 'rgba(232, 197, 109, 0.2)',
    success: '#a3e635',
  },
};

declare global {
  interface Window {
    FlutterWebView?: { postMessage: (message: string) => void; };
    flutter_inappwebview?: { callHandler: (handlerName: string, ...args: any[]) => void; };
    _FlutterWebViewBridge?: (message: string) => void;
  }
}

function sendToFlutter(type: string, data: Record<string, any> = {}) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  try { window.FlutterWebView?.postMessage(message); } catch (_) {}
  try { window.flutter_inappwebview?.callHandler('TasbeehEvent', message); } catch (_) {}
  try { window._FlutterWebViewBridge?.(message); } catch (_) {}
  try { window.parent?.postMessage({ channel: 'tasbeeh', type, data }, '*'); } catch (_) {}
}

function loadState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`tasbeeh-${key}`);
    if (saved) return JSON.parse(saved) as T;
  } catch (_) {}
  return fallback;
}

function saveState(key: string, value: any) {
  try { localStorage.setItem(`tasbeeh-${key}`, JSON.stringify(value)); } catch (_) {}
}

function App() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [currentLap, setCurrentLap] = useState(1);
  const [soundType, setSoundType] = useState<SoundType>(() => loadState('sound', 'none' as SoundType));
  const [theme, setTheme] = useState<ThemeMode>(() => loadState('theme', 'dark' as ThemeMode));
  const [fontSize, setFontSize] = useState<FontSize>(() => loadState('fontSize', 'medium' as FontSize));
  const [selectedDhikr, setSelectedDhikr] = useState<string>(() => loadState('dhikr', 'none'));
  const [customDhikr, setCustomDhikr] = useState<string>(() => loadState('customDhikr', ''));
  const [showSoundPanel, setShowSoundPanel] = useState(false);
  const [showLaps, setShowLaps] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDhikrPicker, setShowDhikrPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [totalAllTime, setTotalAllTime] = useState(() => loadState('total', 0));
  const [showCelebration, setShowCelebration] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('sm');
  const [isLandscape, setIsLandscape] = useState(false);
  const [ripple, setRipple] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const t = THEMES[theme];

  // Font size multipliers
  const fontScale = fontSize === 'small' ? 0.8 : fontSize === 'medium' ? 1 : fontSize === 'large' ? 1.25 : 1.55;

  // Persist state
  useEffect(() => { saveState('sound', soundType); }, [soundType]);
  useEffect(() => { saveState('theme', theme); document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { saveState('fontSize', fontSize); }, [fontSize]);
  useEffect(() => { saveState('dhikr', selectedDhikr); }, [selectedDhikr]);
  useEffect(() => { saveState('customDhikr', customDhikr); }, [customDhikr]);
  useEffect(() => { saveState('total', totalAllTime); }, [totalAllTime]);

  // Responsive
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setIsLandscape(w > h);
      if (w < 360) setScreenSize('xs');
      else if (w < 640) setScreenSize('sm');
      else if (w < 1024) setScreenSize('md');
      else if (w < 1440) setScreenSize('lg');
      else setScreenSize('xl');
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update); };
  }, []);

  // Listen for Flutter messages
  useEffect(() => {
    sendToFlutter('appReady', { theme, fontSize });
    const handler = (event: MessageEvent) => {
      if (event.data?.channel === 'flutter-tasbeeh') {
        const { action, payload } = event.data;
        if (action === 'setTheme' && (payload === 'dark' || payload === 'light' || payload === 'sepia')) setTheme(payload);
        if (action === 'reset') handleReset();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [theme, fontSize]);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (AC) audioContextRef.current = new AC();
      }
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    } catch (_) {}
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (type === 'none') return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    try {
      switch (type) {
        case 'wooden': {
          const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
          f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 2;
          o.type = 'triangle'; o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(100, now + 0.08);
          g.gain.setValueAtTime(0.4, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.1);
          break;
        }
        case 'glass': {
          const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
          o1.type = 'sine'; o1.frequency.setValueAtTime(2000, now); o1.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
          o2.type = 'sine'; o2.frequency.setValueAtTime(3000, now); o2.frequency.exponentialRampToValueAtTime(2500, now + 0.15);
          g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          o1.connect(g); o2.connect(g); g.connect(ctx.destination); o1.start(now); o2.start(now); o1.stop(now + 0.2); o2.stop(now + 0.2);
          break;
        }
        case 'metal': {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square'; o.frequency.setValueAtTime(3000, now); o.frequency.exponentialRampToValueAtTime(500, now + 0.05);
          g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.08);
          break;
        }
        case 'stone': {
          const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
          f.type = 'lowpass'; f.frequency.value = 400;
          o.type = 'sine'; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.12);
          g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.15);
          break;
        }
        case 'bell': {
          const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator(), g = ctx.createGain();
          o1.type = 'sine'; o1.frequency.value = 800;
          o2.type = 'sine'; o2.frequency.value = 1200;
          o3.type = 'sine'; o3.frequency.value = 1600;
          g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          o1.connect(g); o2.connect(g); o3.connect(g); g.connect(ctx.destination);
          o1.start(now); o2.start(now); o3.start(now); o1.stop(now + 0.5); o2.stop(now + 0.5); o3.stop(now + 0.5);
          break;
        }
      }
    } catch (_) {}
  }, [getAudioContext]);

  const triggerHaptic = useCallback(() => {
    try { navigator.vibrate?.(30); } catch (_) {}
    sendToFlutter('haptic', { type: 'light', duration: 30 });
  }, []);

  const handleCount = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setTotalAllTime(prev => prev + 1);
    playSound(soundType);
    triggerHaptic();
    setRipple(true);
    setTimeout(() => setRipple(false), 400);
    sendToFlutter('count', { count: newCount, target, totalAllTime: totalAllTime + 1 });

    if (newCount >= target) {
      setLaps(prev => [...prev, { lap: currentLap, target, timestamp: new Date() }]);
      setCurrentLap(prev => prev + 1);
      setCount(0);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
      try { navigator.vibrate?.([100, 50, 100, 50, 200]); } catch (_) {}
      sendToFlutter('lapComplete', { lap: currentLap, target });
      sendToFlutter('haptic', { type: 'heavy', pattern: [100, 50, 100, 50, 200] });
    }
  }, [count, target, currentLap, soundType, totalAllTime, playSound, triggerHaptic]);

  const handleReset = useCallback(() => {
    setCount(0); setCurrentLap(1); setLaps([]);
    sendToFlutter('reset', {});
  }, []);

  const handleDhikrSelect = (id: string) => {
    setSelectedDhikr(id);
    const dhikr = DHIKR_LIST.find(d => d.id === id);
    if (dhikr && id !== 'custom' && id !== 'none') {
      setTarget(dhikr.defaultTarget);
      setCount(0); setCurrentLap(1); setLaps([]);
    }
    setShowDhikrPicker(false);
  };

  const progress = target > 0 ? (count / target) * 100 : 0;
  const currentDhikr = DHIKR_LIST.find(d => d.id === selectedDhikr);
  const isSmall = screenSize === 'xs';
  const isTiny = screenSize === 'xs' && window.innerHeight < 600;

  // Dynamic sizing
  const getRingSize = () => {
    if (isTiny) return 'min(48vw, 38vh, 180px)';
    if (screenSize === 'xs') return 'min(52vw, 40vh, 200px)';
    if (screenSize === 'sm') return 'min(56vw, 38vh, 240px)';
    if (screenSize === 'md') return 'min(40vw, 38vh, 280px)';
    if (screenSize === 'lg') return 'min(30vw, 35vh, 300px)';
    return 'min(26vw, 30vh, 320px)';
  };

  const getButtonSize = () => {
    if (isTiny) return 'min(32vw, 26vh, 130px)';
    if (screenSize === 'xs') return 'min(35vw, 28vh, 145px)';
    if (screenSize === 'sm') return 'min(38vw, 26vh, 160px)';
    if (screenSize === 'md') return 'min(26vw, 24vh, 180px)';
    if (screenSize === 'lg') return 'min(18vw, 20vh, 190px)';
    return 'min(15vw, 18vh, 200px)';
  };

  // Counter font size scales with both screen size AND user preference
  const counterFontSize = () => {
    const base = isTiny ? 2.2 : screenSize === 'xs' ? 2.8 : screenSize === 'sm' ? 3.5 : 4.2;
    return `${base * fontScale}rem`;
  };

  return (
    <div
      className="w-full flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${t.bg1} 0%, ${t.bg2} 45%, ${t.bg3} 100%)`,
        color: t.text,
        transition: 'background 0.5s ease, color 0.5s ease',
        minHeight: '100dvh',
        height: '100dvh',
      }}
    >
      {/* Animated background pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        opacity: 0.04,
        backgroundImage: `radial-gradient(circle, ${t.gold} 1px, transparent 1px)`,
        backgroundSize: isSmall ? '26px 26px' : '44px 44px',
      }} />

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="text-center" style={{ animation: 'celebPop 0.6s ease-out' }}>
            <div style={{ fontSize: isSmall ? '3rem' : '4.5rem' }}>✨</div>
            <div className="font-bold mt-2" style={{ color: t.gold, fontSize: isSmall ? '1.3rem' : '2rem', textShadow: t.textGlow }}>
              Target Complete!
            </div>
            <div className="mt-1" style={{ color: t.textMuted, fontSize: isSmall ? '0.85rem' : '1.05rem' }}>
              Lap {currentLap - 1} of {target}x ✓
            </div>
          </div>
        </div>
      )}

      {/* Top Bar - Dhikr Selector */}
      <header
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: `${isSmall ? '0.4rem' : '0.6rem'} ${isSmall ? '0.6rem' : '1rem'}`,
          paddingTop: `max(${isSmall ? '0.4rem' : '0.6rem'}, env(safe-area-inset-top))`,
        }}
      >
        <button
          onClick={() => setShowDhikrPicker(true)}
          className="flex-1 text-left rounded-xl transition-all active:scale-[0.98]"
          style={{
            padding: isSmall ? '0.35rem 0.6rem' : '0.5rem 0.8rem',
            backgroundColor: t.goldDim,
            border: `1px solid ${t.goldBorder}`,
          }}
        >
          <div style={{ color: t.textDim, fontSize: isSmall ? '0.55rem' : '0.65rem', letterSpacing: '0.05em' }}>
            DHIKR
          </div>
          <div className="font-semibold truncate" style={{ color: t.gold, fontSize: isSmall ? '0.75rem' : '0.9rem' }}>
            {currentDhikr?.transliteration || 'Select...'}
          </div>
        </button>

        {/* Theme Quick Switch */}
        <div className="flex gap-1 ml-2 flex-shrink-0">
          {(['dark', 'light', 'sepia'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className="rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                width: isSmall ? '30px' : '36px',
                height: isSmall ? '30px' : '36px',
                backgroundColor: theme === mode ? t.gold : t.goldDim,
                border: `1.5px solid ${theme === mode ? t.gold : t.goldBorder}`,
              }}
              aria-label={`${mode} theme`}
            >
              <span style={{ fontSize: isSmall ? '0.85rem' : '1rem' }}>
                {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '📜'}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Target Presets - Scrollable */}
      <div className="flex-shrink-0 px-2" style={{ paddingBottom: '0.3rem' }}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 justify-center flex-wrap" style={{ scrollbarWidth: 'none' }}>
          {TARGET_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { setTarget(preset); setCount(0); setCurrentLap(1); setLaps([]); sendToFlutter('targetChanged', { target: preset }); }}
              className="rounded-full font-semibold transition-all duration-200 active:scale-95 flex-shrink-0"
              style={{
                padding: isSmall ? '0.2rem 0.55rem' : '0.3rem 0.8rem',
                fontSize: isSmall ? '0.6rem' : '0.75rem',
                backgroundColor: target === preset ? t.gold : 'transparent',
                color: target === preset ? t.bg1 : t.gold,
                border: `1.5px solid ${t.gold}`,
                transform: target === preset ? 'scale(1.08)' : 'scale(1)',
                boxShadow: target === preset ? `0 0 15px ${t.goldDim}` : 'none',
              }}
            >
              {preset >= 1000 ? `${preset / 1000}k` : preset}x
            </button>
          ))}
          <button
            onClick={() => setShowTargetPicker(true)}
            className="rounded-full font-semibold transition-all active:scale-95 flex-shrink-0"
            style={{
              padding: isSmall ? '0.2rem 0.55rem' : '0.3rem 0.8rem',
              fontSize: isSmall ? '0.6rem' : '0.75rem',
              backgroundColor: 'transparent',
              color: t.gold,
              border: `1.5px dashed ${t.goldBorder}`,
            }}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 flex ${isLandscape && screenSize !== 'xl' ? 'flex-row' : 'flex-col'} items-center justify-center gap-1 sm:gap-3 px-2`}
        style={{ minHeight: 0 }}
      >
        {/* Dhikr Display */}
        {selectedDhikr !== 'none' && (
          <div className="text-center flex-shrink-0" style={{ padding: '0.3rem 0' }}>
            {currentDhikr?.arabic && (
              <div className="font-bold" style={{
                color: t.gold,
                fontSize: `${(isSmall ? 1.1 : 1.5) * fontScale}rem`,
                textShadow: t.textGlow,
                lineHeight: 1.3,
                direction: 'rtl',
              }}>
                {selectedDhikr === 'custom' ? customDhikr || 'Custom Dhikr' : currentDhikr.arabic}
              </div>
            )}
            {currentDhikr?.meaning && selectedDhikr !== 'custom' && (
              <div style={{ color: t.textDim, fontSize: `${(isSmall ? 0.6 : 0.75) * fontScale}rem`, marginTop: '0.15rem' }}>
                {currentDhikr.meaning}
              </div>
            )}
          </div>
        )}

        {/* Progress Ring + Counter */}
        <div
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ width: getRingSize(), height: getRingSize() }}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="116" fill="none" stroke={t.ringTrack} strokeWidth="10" />
            <circle
              cx="128" cy="128" r="116" fill="none" stroke={t.gold} strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 116}`}
              strokeDashoffset={`${2 * Math.PI * 116 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-150"
              style={{ filter: t.progressGlow }}
            />
          </svg>
          <div className="text-center z-10">
            <div className="font-bold tabular-nums" style={{
              color: t.gold,
              fontSize: counterFontSize(),
              textShadow: t.textGlow,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>
              {count}
            </div>
            <div style={{ color: t.textMuted, fontSize: `${(isSmall ? 0.75 : 0.95) * fontScale}rem`, marginTop: '0.2rem' }}>
              / {target}
            </div>
            <div style={{ color: t.textDim, fontSize: `${(isSmall ? 0.6 : 0.75) * fontScale}rem` }}>
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
          className="rounded-full flex items-center justify-center select-none flex-shrink-0 relative overflow-hidden"
          style={{
            width: getButtonSize(),
            height: getButtonSize(),
            background: t.buttonBg,
            boxShadow: isPressed
              ? `inset 0 6px 20px ${t.shadow}, 0 0 25px ${t.goldDim}`
              : `0 10px 40px ${t.shadow}, 0 0 40px ${t.goldDim}, inset 0 -4px 10px ${t.shadow}`,
            border: `3px solid ${t.gold}`,
            transform: isPressed ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
        >
          {/* Ripple effect */}
          {ripple && (
            <div className="absolute inset-0 rounded-full" style={{
              background: `radial-gradient(circle, ${t.gold}40 0%, transparent 70%)`,
              animation: 'rippleOut 0.4s ease-out',
            }} />
          )}
          <div className="text-center z-10">
            <div style={{ fontSize: isSmall ? '1.8rem' : screenSize === 'sm' ? '2.2rem' : '2.8rem' }}>📿</div>
            <div className="font-bold" style={{ color: t.gold, fontSize: `${(isSmall ? 0.65 : 0.85) * fontScale}rem` }}>
              TAP
            </div>
          </div>
        </button>
      </main>

      {/* Stats Bar */}
      <div
        className="flex justify-between items-center rounded-2xl mx-auto flex-shrink-0"
        style={{
          width: 'min(94%, 420px)',
          padding: isSmall ? '0.35rem 0.4rem' : '0.5rem 0.8rem',
          backgroundColor: t.cardBg,
          border: `1px solid ${t.cardBorder}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          margin: '0.3rem auto',
        }}
      >
        {[
          { value: currentLap, label: 'Lap' },
          { value: laps.length, label: 'Done' },
          { value: totalAllTime, label: 'Total' },
        ].map((stat, i) => (
          <div key={i} className="text-center flex-1" style={i < 2 ? { borderRight: `1px solid ${t.cardBorder}` } : {}}>
            <div className="font-bold" style={{ color: t.gold, fontSize: `${(isSmall ? 0.85 : 1.1) * fontScale}rem` }}>
              {stat.value}
            </div>
            <div style={{ color: t.textMuted, fontSize: `${(isSmall ? 0.5 : 0.65) * fontScale}rem` }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls with Labels */}
      <div
        className="flex justify-center gap-4 sm:gap-6 flex-shrink-0"
        style={{
          padding: '0.5rem 0.75rem',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {[
          { icon: '🔔', label: 'Sound', action: () => setShowSoundPanel(true) },
          { icon: '📋', label: 'Lap', action: () => setShowLaps(true) },
          { icon: '🔄', label: 'Reset', action: handleReset },
          { icon: '⚙️', label: 'Settings', action: () => setShowSettings(true) },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="flex flex-col items-center gap-0.5 transition-all active:scale-90"
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: isSmall ? '40px' : '48px',
                height: isSmall ? '40px' : '48px',
                backgroundColor: t.goldDim,
                border: `1.5px solid ${t.goldBorder}`,
              }}
            >
              <span style={{ fontSize: isSmall ? '1rem' : '1.25rem' }}>{btn.icon}</span>
            </div>
            <span style={{
              color: t.textMuted,
              fontSize: isSmall ? '0.55rem' : '0.65rem',
              fontWeight: 500,
            }}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* Sound Panel */}
      {showSoundPanel && (
        <Modal onClose={() => setShowSoundPanel(false)} t={t} isSmall={isSmall}>
          <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
            🔔 Sound
          </h2>
          <div className="space-y-1.5">
            {SOUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => { setSoundType(option.value); if (option.value !== 'none') playSound(option.value); }}
                className="w-full flex items-center gap-2.5 rounded-xl transition-all active:scale-[0.98]"
                style={{
                  padding: isSmall ? '0.5rem 0.7rem' : '0.65rem 0.9rem',
                  backgroundColor: soundType === option.value ? t.accentSoft : t.cardBg,
                  border: soundType === option.value ? `2px solid ${t.gold}` : `1px solid ${t.cardBorder}`,
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{option.icon}</span>
                <span className="font-medium flex-1 text-left" style={{
                  color: soundType === option.value ? t.gold : t.textMuted,
                  fontSize: isSmall ? '0.75rem' : '0.85rem',
                }}>
                  {option.label}
                </span>
                {soundType === option.value && (
                  <span className="px-1.5 py-0.5 rounded-full font-semibold" style={{
                    backgroundColor: t.gold, color: t.bg1, fontSize: '0.6rem',
                  }}>Active</span>
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} t={t} isSmall={isSmall}>
          <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
            ⚙️ Settings
          </h2>

          {/* Theme */}
          <div className="mb-3">
            <div className="font-semibold mb-1.5" style={{ color: t.textMuted, fontSize: isSmall ? '0.7rem' : '0.8rem' }}>THEME</div>
            <div className="flex gap-2">
              {(['dark', 'light', 'sepia'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className="flex-1 py-2 rounded-xl font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor: theme === mode ? t.gold : t.cardBg,
                    color: theme === mode ? t.bg1 : t.textMuted,
                    border: `1.5px solid ${theme === mode ? t.gold : t.cardBorder}`,
                    fontSize: isSmall ? '0.7rem' : '0.8rem',
                  }}
                >
                  {mode === 'dark' ? '🌙 Dark' : mode === 'light' ? '☀️ Light' : '📜 Sepia'}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-3">
            <div className="font-semibold mb-1.5" style={{ color: t.textMuted, fontSize: isSmall ? '0.7rem' : '0.8rem' }}>FONT SIZE</div>
            <div className="flex gap-1.5">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className="flex-1 py-2 rounded-xl font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor: fontSize === size.value ? t.gold : t.cardBg,
                    color: fontSize === size.value ? t.bg1 : t.textMuted,
                    border: `1.5px solid ${fontSize === size.value ? t.gold : t.cardBorder}`,
                    fontSize: size.value === 'small' ? '0.7rem' : size.value === 'medium' ? '0.8rem' : size.value === 'large' ? '0.95rem' : '1.1rem',
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dhikr Selection */}
          <div>
            <div className="font-semibold mb-1.5" style={{ color: t.textMuted, fontSize: isSmall ? '0.7rem' : '0.8rem' }}>DHIKR</div>
            <button
              onClick={() => { setShowSettings(false); setShowDhikrPicker(true); }}
              className="w-full py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
              style={{
                backgroundColor: t.accentSoft,
                color: t.gold,
                border: `1.5px solid ${t.goldBorder}`,
                fontSize: isSmall ? '0.75rem' : '0.85rem',
              }}
            >
              Change Dhikr → {currentDhikr?.transliteration}
            </button>
          </div>
        </Modal>
      )}

      {/* Dhikr Picker */}
      {showDhikrPicker && (
        <Modal onClose={() => setShowDhikrPicker(false)} t={t} isSmall={isSmall}>
          <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
            📿 Select Dhikr
          </h2>
          <div className="space-y-1.5">
            {DHIKR_LIST.map((dhikr) => (
              <button
                key={dhikr.id}
                onClick={() => handleDhikrSelect(dhikr.id)}
                className="w-full text-left rounded-xl transition-all active:scale-[0.98]"
                style={{
                  padding: isSmall ? '0.5rem 0.7rem' : '0.65rem 0.9rem',
                  backgroundColor: selectedDhikr === dhikr.id ? t.accentSoft : t.cardBg,
                  border: selectedDhikr === dhikr.id ? `2px solid ${t.gold}` : `1px solid ${t.cardBorder}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate" style={{ color: selectedDhikr === dhikr.id ? t.gold : t.text, fontSize: isSmall ? '0.75rem' : '0.85rem' }}>
                      {dhikr.transliteration}
                    </div>
                    <div className="truncate" style={{ color: t.textDim, fontSize: isSmall ? '0.6rem' : '0.7rem' }}>
                      {dhikr.meaning}
                    </div>
                  </div>
                  {dhikr.arabic && (
                    <div className="ml-2 flex-shrink-0" style={{ color: t.gold, fontSize: isSmall ? '0.9rem' : '1.1rem', direction: 'rtl' }}>
                      {dhikr.arabic.slice(0, 15)}...
                    </div>
                  )}
                </div>
                {dhikr.id === 'custom' && selectedDhikr === 'custom' && (
                  <input
                    type="text"
                    value={customDhikr}
                    onChange={(e) => setCustomDhikr(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Enter your dhikr..."
                    className="w-full mt-2 px-2 py-1.5 rounded-lg text-left"
                    style={{
                      backgroundColor: t.bg1,
                      color: t.text,
                      border: `1px solid ${t.goldBorder}`,
                      fontSize: isSmall ? '0.75rem' : '0.85rem',
                      outline: 'none',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Target Custom Picker */}
      {showTargetPicker && (
        <Modal onClose={() => setShowTargetPicker(false)} t={t} isSmall={isSmall}>
          <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
            🎯 Custom Target
          </h2>
          <input
            type="number"
            min="1"
            max="100000"
            defaultValue={target}
            id="custom-target-input"
            className="w-full px-3 py-3 rounded-xl text-center font-bold"
            style={{
              backgroundColor: t.bg1,
              color: t.gold,
              border: `2px solid ${t.goldBorder}`,
              fontSize: '1.5rem',
              outline: 'none',
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('custom-target-input') as HTMLInputElement;
              const val = parseInt(input?.value || '0');
              if (val > 0) { setTarget(val); setCount(0); setCurrentLap(1); setLaps([]); }
              setShowTargetPicker(false);
            }}
            className="w-full mt-3 py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: t.gold, color: t.bg1, fontSize: isSmall ? '0.85rem' : '0.95rem' }}
          >
            Set Target
          </button>
        </Modal>
      )}

      {/* Laps Modal */}
      {showLaps && (
        <Modal onClose={() => setShowLaps(false)} t={t} isSmall={isSmall}>
          <h2 className="font-bold text-center mb-3" style={{ color: t.gold, fontSize: isSmall ? '1rem' : '1.2rem' }}>
            📋 Lap History
          </h2>
          {laps.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }} className="mb-2">📿</div>
              <p style={{ color: t.textMuted, fontSize: isSmall ? '0.75rem' : '0.875rem' }}>No completed laps yet</p>
              <p style={{ color: t.textDim, fontSize: isSmall ? '0.65rem' : '0.75rem' }} className="mt-1">
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
                        width: isSmall ? '26px' : '32px', height: isSmall ? '26px' : '32px',
                        backgroundColor: t.gold, color: t.bg1, fontSize: isSmall ? '0.6rem' : '0.75rem',
                      }}>
                      {lap.lap}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: t.gold, fontSize: isSmall ? '0.7rem' : '0.85rem' }}>
                        {lap.target}x completed
                      </div>
                      <div style={{ color: t.textDim, fontSize: isSmall ? '0.55rem' : '0.7rem' }}>
                        {lap.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: t.success, fontSize: '1rem' }}>✓</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// Reusable Modal Component
function Modal({ children, onClose, t, isSmall }: {
  children: React.ReactNode;
  onClose: () => void;
  t: typeof THEMES.dark;
  isSmall: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" style={{ padding: isSmall ? '0.6rem' : '1rem' }} onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: t.overlay, animation: 'fadeIn 0.2s ease-out' }} />
      <div
        className="relative z-10 w-full rounded-3xl overflow-y-auto"
        style={{
          maxWidth: 'min(94vw, 420px)',
          maxHeight: '82dvh',
          background: t.modalBg,
          border: `2px solid ${t.goldBorder}`,
          boxShadow: `0 25px 70px ${t.shadow}, 0 0 50px ${t.goldDim}`,
          padding: isSmall ? '0.9rem' : '1.3rem',
          animation: 'slideUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98]"
          style={{ backgroundColor: t.gold, color: t.bg1, fontSize: isSmall ? '0.8rem' : '0.9rem' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default App;
