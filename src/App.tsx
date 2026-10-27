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

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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
        // Wooden bead - short percussive sound
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
        // Glass bead - bright, resonant
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
        // Metal click - sharp, bright
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
        // Stone drop - deep, thuddy
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
        // Temple bell - resonant, long decay
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

    // Check if target reached
    if (newCount >= target) {
      setLaps(prev => [...prev, { lap: currentLap, target, timestamp: new Date() }]);
      setCurrentLap(prev => prev + 1);
      setCount(0);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      
      // Extra haptic for lap completion
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
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #00160D 0%, #003D2B 50%, #005A3C 100%)' }}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #D4AF37 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #D4AF37 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <div className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
              Target Complete!
            </div>
            <div className="text-xl text-green-200 mt-2">
              Lap {currentLap - 1} of {target}x ✓
            </div>
          </div>
        </div>
      )}

      {/* Main Counter Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-6 flex flex-col h-screen max-h-screen">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: '#D4AF37' }}>
            بِسْمِ اللَّهِ
          </h1>
          <p className="text-xs text-green-300/70 mt-1">Digital Tasbeeh Counter</p>
        </div>

        {/* Target Presets */}
        <div className="flex justify-center gap-2 mb-4">
          {TARGET_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { setTarget(preset); setCount(0); setCurrentLap(1); setLaps([]); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                target === preset
                  ? 'shadow-lg scale-105'
                  : 'opacity-60 hover:opacity-90'
              }`}
              style={{
                backgroundColor: target === preset ? '#D4AF37' : 'transparent',
                color: target === preset ? '#00160D' : '#D4AF37',
                borderColor: '#D4AF37',
              }}
            >
              {preset}x
            </button>
          ))}
        </div>

        {/* Main Counter Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          
          {/* Progress Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-6">
            {/* Background circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128" cy="128" r="118"
                fill="none"
                stroke="#003D2B"
                strokeWidth="6"
              />
              <circle
                cx="128" cy="128" r="118"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 118}`}
                strokeDashoffset={`${2 * Math.PI * 118 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            </svg>
            
            {/* Counter Display */}
            <div className="text-center z-10">
              <div className="text-7xl font-bold tabular-nums" style={{ color: '#D4AF37' }}>
                {count}
              </div>
              <div className="text-sm text-green-300/70 mt-1">
                / {target}
              </div>
              <div className="text-xs text-green-400/50 mt-1">
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Count Button */}
          <button
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            onClick={handleCount}
            className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-100 select-none
              ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
              active:scale-95`}
            style={{
              background: `radial-gradient(circle at 30% 30%, #005A3C, #003D2B, #00160D)`,
              boxShadow: isPressed
                ? 'inset 0 4px 12px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.2)'
                : '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(212, 175, 55, 0.1), inset 0 -4px 8px rgba(0,0,0,0.3)',
              border: '3px solid #D4AF37',
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-1">📿</div>
              <div className="text-sm font-semibold" style={{ color: '#D4AF37' }}>
                TAP
              </div>
            </div>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center px-4 py-3 rounded-2xl mb-3"
          style={{ backgroundColor: 'rgba(0, 61, 43, 0.5)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: '#D4AF37' }}>{currentLap}</div>
            <div className="text-xs text-green-300/60">Lap</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: '#D4AF37' }}>{laps.length}</div>
            <div className="text-xs text-green-300/60">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: '#D4AF37' }}>{totalAllTime}</div>
            <div className="text-xs text-green-300/60">Total</div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)' }}
          >
            <span className="text-xl">⚙️</span>
          </button>
          <button
            onClick={() => setShowLaps(!showLaps)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)' }}
          >
            <span className="text-xl">📋</span>
          </button>
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)' }}
          >
            <span className="text-xl">🔄</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            className="relative z-50 w-full max-w-sm rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #003D2B, #00160D)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#D4AF37' }}>
              🔊 Sound Settings
            </h2>
            
            <div className="space-y-3">
              {SOUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSoundType(option.value);
                    if (option.value !== 'none') playSound(option.value);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    soundType === option.value ? 'scale-[1.02]' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: soundType === option.value ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 90, 60, 0.3)',
                    border: soundType === option.value ? '2px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.15)',
                  }}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium" style={{ color: soundType === option.value ? '#D4AF37' : '#86efac' }}>
                    {option.label}
                  </span>
                  {soundType === option.value && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#D4AF37', color: '#00160D' }}>
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#D4AF37', color: '#00160D' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Laps Modal */}
      {showLaps && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setShowLaps(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            className="relative z-50 w-full max-w-sm rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #003D2B, #00160D)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#D4AF37' }}>
              📋 Lap History
            </h2>
            
            {laps.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📿</div>
                <p className="text-green-300/60 text-sm">No completed laps yet</p>
                <p className="text-green-300/40 text-xs mt-1">Complete {target} counts to record a lap</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...laps].reverse().map((lap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(0, 90, 60, 0.3)', border: '1px solid rgba(212, 175, 55, 0.15)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#D4AF37', color: '#00160D' }}>
                        {lap.lap}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#D4AF37' }}>
                          {lap.target}x completed
                        </div>
                        <div className="text-xs text-green-300/50">
                          {lap.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-green-400">✓</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLaps(false)}
              className="w-full mt-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#D4AF37', color: '#00160D' }}
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
