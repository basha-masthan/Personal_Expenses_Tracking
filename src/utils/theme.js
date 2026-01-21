export const theme = {
  colors: {
    background: '#0F172A', // Slate 900
    surface: '#1E293B',    // Slate 800
    surfaceLight: '#334155', // Slate 700 / lighten for visual hierarchy
    primary: '#8B5CF6',    // Violet 500
    secondary: '#10B981',  // Emerald 500
    accent: '#F43F5E',     // Rose 500
    text: '#F8FAFC',       // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    border: '#334155',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 2,
    }
  },
  typography: {
    header: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
    subheader: { fontSize: 24, fontWeight: '700', color: '#F8FAFC' },
    title: { fontSize: 20, fontWeight: '600', color: '#F8FAFC' },
    body: { fontSize: 16, color: '#F8FAFC', lineHeight: 24 },
    caption: { fontSize: 13, color: '#94A3B8' },
    label: { fontSize: 14, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  }
};
