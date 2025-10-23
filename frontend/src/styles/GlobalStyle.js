import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

  :root {
    color-scheme: light;
    font-family: 'SF Pro Display', 'Inter', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f5f6f8;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(160% 120% at 50% -20%, rgba(255, 255, 255, 0.9) 0%, rgba(232, 236, 242, 0.9) 45%, rgba(218, 225, 233, 0.85) 100%),
      linear-gradient(180deg, #f9fafc 0%, #eef1f5 60%, #e4e8ee 100%);
    color: #111827;
    padding: min(8vh, 6rem) clamp(1.5rem, 4vw, 3.5rem);
  }

  #root {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  button, input, select {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::selection {
    background: rgba(37, 99, 235, 0.22);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default GlobalStyle;
