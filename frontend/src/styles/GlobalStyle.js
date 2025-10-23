import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    color-scheme: light;
    font-family: 'Inter', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f5f7fb;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: linear-gradient(160deg, #f7f9fc 0%, #edf2fb 35%, #f9fafc 100%);
    color: #0b1f33;
    padding: clamp(0.35rem, 1.4vw, 1.1rem) clamp(0.9rem, 3vw, 2.2rem);
    display: flex;
    justify-content: center;
    align-items: flex-start;
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
    background: rgba(99, 102, 241, 0.35);
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
