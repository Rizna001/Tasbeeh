import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

// Animated Tasbeeh/Beads icon
export const TasbeehIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '', animate = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} ${animate ? 'animate-tasbeeh' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="4" r="2" fill={color} className="animate-bead-1" />
    <circle cx="17" cy="6" r="2" fill={color} className="animate-bead-2" />
    <circle cx="19" cy="11" r="2" fill={color} className="animate-bead-3" />
    <circle cx="17" cy="16" r="2" fill={color} className="animate-bead-4" />
    <circle cx="12" cy="18" r="2" fill={color} className="animate-bead-5" />
    <circle cx="7" cy="16" r="2" fill={color} className="animate-bead-6" />
    <circle cx="5" cy="11" r="2" fill={color} className="animate-bead-7" />
    <circle cx="7" cy="6" r="2" fill={color} className="animate-bead-8" />
    <path d="M12 20 L12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Animated Bell icon for sound
export const BellIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '', animate = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} ${animate ? 'animate-bell' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3C8.5 3 6 6 6 9C6 13 4 15 4 15H20C20 15 18 13 18 9C18 6 15.5 3 12 3Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="2" r="1" fill={color} />
    {animate && (
      <>
        <path d="M3 10 L1 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" className="animate-wave-1" />
        <path d="M21 10 L23 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" className="animate-wave-2" />
      </>
    )}
  </svg>
);

// List/Lap icon
export const ListIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="3" rx="1" fill={color} opacity="0.8" />
    <rect x="3" y="10.5" width="18" height="3" rx="1" fill={color} opacity="0.6" />
    <rect x="3" y="17" width="18" height="3" rx="1" fill={color} opacity="0.4" />
  </svg>
);

// Reset/Refresh icon
export const ResetIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '', animate = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} ${animate ? 'animate-spin-slow' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 12C4 7.58 7.58 4 12 4C14.76 4 17.2 5.34 18.7 7.44L21 5V11H15L17.3 8.7C16.14 7.08 14.2 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C14.2 18 16.14 16.92 17.3 15.3"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Settings/Gear icon
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '', animate = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} ${animate ? 'animate-gear' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
    <path
      d="M12 2L13.5 4.5L16.5 3.5L16 6.5L19 7.5L17.5 10L20 12L17.5 14L19 16.5L16 17.5L16.5 20.5L13.5 19.5L12 22L10.5 19.5L7.5 20.5L8 17.5L5 16.5L6.5 14L4 12L6.5 10L5 7.5L8 6.5L7.5 3.5L10.5 4.5L12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Moon icon for dark theme
export const MoonIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

// Sun icon for light theme
export const SunIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="4" fill={color} />
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Scroll/Parchment icon for sepia theme
export const ScrollIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 3C6.9 3 6 3.9 6 5V19C6 20.1 6.9 21 8 21H18V5C18 3.9 17.1 3 16 3H8Z" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
    <path d="M6 5C6 3.9 5.1 3 4 3C2.9 3 2 3.9 2 5V17C2 18.1 2.9 19 4 19H6" stroke={color} strokeWidth="1.5" />
    <path d="M10 8H15M10 12H15M10 16H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Language/Globe icon
export const GlobeIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.5" />
    <path d="M3 12H21M4 7H20M4 17H20" stroke={color} strokeWidth="1.2" />
  </svg>
);

// Celebration sparkle
export const SparkleIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} animate-sparkle`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill={color} />
    <path d="M18 16L18.75 18.25L21 19L18.75 19.75L18 22L17.25 19.75L15 19L17.25 18.25L18 16Z" fill={color} opacity="0.7" />
    <path d="M5 14L5.5 15.5L7 16L5.5 16.5L5 18L4.5 16.5L3 16L4.5 15.5L5 14Z" fill={color} opacity="0.5" />
  </svg>
);

// Checkmark icon
export const CheckIcon: React.FC<IconProps> = ({ size = 24, color = '#4ade80', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 12L10 17L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Close X icon
export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = '#D4AF37', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6L18 18M6 18L18 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
