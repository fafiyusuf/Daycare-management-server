export const themeConfig = {
  colors: {
    primary: '#FFD700', // Gold yellow
    secondary: '#FB9E3A', // Bright orange
    accent: '#27548A', // Deep blue (kept for contrast)
    background: {
      light: '#FFFFFF', // White
      dark: '#121212', // Very dark
    },
    card: {
      light: '#FFFFFF', // White
      dark: '#1E1E1E', // Dark gray
    },
    text: {
      light: '#333333', // Dark gray
      dark: '#FFFFFF', // White
    },
    success: '#4CAF50', // Green
    warning: '#FB9E3A', // Orange
    error: '#FF4444', // Red
    muted: '#666666', // Muted gray
    primaryHover: '#FFDE59', // Lighter yellow
    secondaryHover: '#FF8C00', // Orange-red
    accentHover: '#1A3B66', // Darker blue
  },
  gradients: {
    light: 'from-[#FFD700] via-[#FB9E3A] to-[#27548A]',
    dark: 'from-[#1E1E1E] via-[#121212] to-[#0D0D0D]',
  },
  shadows: {
    light: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    dark: '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)',
  },
}
