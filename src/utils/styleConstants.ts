
// Layout and spacing constants
export const LAYOUT = {
  SIDEBAR_WIDTH: {
    EXPANDED: 256,
    COLLAPSED: 64,
  },
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  CONTAINER_PADDING: {
    MOBILE: 16,
    DESKTOP: 24,
  },
} as const;

// Common spacing values
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

// Typography scale
export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: '0.75rem',  // 12px
    SM: '0.875rem', // 14px
    BASE: '1rem',   // 16px
    LG: '1.125rem', // 18px
    XL: '1.25rem',  // 20px
    '2XL': '1.5rem', // 24px
    '3XL': '1.875rem', // 30px
  },
  LINE_HEIGHTS: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.625,
  },
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-index scale
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;
