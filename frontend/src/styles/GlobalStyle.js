import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    color-scheme: light;
    font-family: 'Inter', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #0f172a;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(110% 110% at 50% 0%, rgba(90, 53, 255, 0.16) 0%, rgba(15, 23, 42, 0.95) 50%), #0f172a;
    color: #0f172a;
    padding: 2.5rem 1.5rem;
  }

  #root {
    width: 100%;
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
