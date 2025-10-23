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
    background: linear-gradient(180deg, #f2f4ff 0%, #ffffff 55%, #ffffff 100%);
    color: #0b1f33;
    padding: 8px clamp(16px, 3vw, 24px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  body::before {
    content: '';
    position: fixed;
    inset: -35% -20% 0 -20%;
    background:
      radial-gradient(40% 35% at 20% 15%, rgba(99, 102, 241, 0.22), transparent 65%),
      radial-gradient(45% 40% at 80% 10%, rgba(139, 92, 246, 0.18), transparent 68%),
      radial-gradient(50% 45% at 30% 75%, rgba(56, 189, 248, 0.16), transparent 70%);
    opacity: 0.85;
    filter: blur(0px);
    transform: translate3d(0, 0, 0);
    pointer-events: none;
    z-index: -1;
    animation: auroraDrift 22s ease-in-out infinite alternate;
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

  @keyframes auroraDrift {
    0% {
      transform: translate3d(-2%, -2%, 0) scale(1.05);
      filter: blur(0px);
      opacity: 0.9;
    }
    35% {
      transform: translate3d(2%, 1.5%, 0) scale(1.08);
      opacity: 0.95;
    }
    70% {
      transform: translate3d(-1%, 3%, 0) scale(1.03);
      opacity: 0.88;
    }
    100% {
      transform: translate3d(2%, 4%, 0) scale(1.07);
      filter: blur(2px);
      opacity: 0.92;
    }
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
