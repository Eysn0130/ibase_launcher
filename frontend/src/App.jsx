import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
    filter: blur(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
`;

const Shell = styled.div`
  width: 100%;
  display: grid;
  gap: clamp(1rem, 2vw, 1.6rem);
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
`;

const Bar = styled.div`
  height: 72px;
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 0 clamp(1.25rem, 4vw, 3rem);

  @media (max-width: 720px) {
    grid-template-columns: auto auto;
    height: 62px;
    gap: 12px;
    padding: 0 clamp(0.75rem, 6vw, 1.6rem);
  }
`;

const Brand = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  align-items: center;

  .logo {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6c47ff, #7b57ff);
    color: #ffffff;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: -0.02em;
    box-shadow: 0 10px 24px rgba(108, 71, 255, 0.28);
  }

  .tt {
    line-height: 1.1;
    display: grid;
    gap: 1px;
  }

  .title {
    font-size: 16.5px;
    font-weight: 600;
    color: #0f172a;
  }

  .sub {
    font-size: 12.5px;
    color: #5c6274;
  }
`;

const Nav = styled.nav`
  justify-self: center;
  display: flex;
  align-items: center;

  @media (max-width: 720px) {
    display: none;
  }
`;

const CTA = styled.button`
  justify-self: end;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  background: #7b57ff;
  color: #ffffff;
  border: none;
  transition: filter 0.16s ease;
  cursor: pointer;

  &:hover {
    filter: brightness(1.04);
  }

  @media (max-width: 720px) {
    justify-self: end;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
`;

const NavItem = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: -12px;
`;

const navItemBase = css`
  font-size: 14px;
  color: #5b5e72;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.16s ease;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  font-weight: 500;
`;

const NavLinkStyled = styled.a`
  ${navItemBase};

  &:hover {
    color: #23253a;
  }

  &[data-active='true'] {
    color: #6c47ff;
    font-weight: 600;
  }
`;

const DropdownToggle = styled.button`
  ${navItemBase};
  position: relative;
  padding-right: 16px;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform-origin: center;
    rotate: 45deg;
    transition: transform 0.16s ease;
  }

  &[data-open='true']::after {
    transform: translateY(-50%) rotate(225deg);
  }

  &:hover {
    color: #23253a;
  }

  &[data-active='true'] {
    color: #6c47ff;
    font-weight: 600;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 14px);
  left: 0;
  min-width: 240px;
  display: ${(props) => (props.$open ? 'grid' : 'none')};
  gap: 8px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  z-index: 40;
`;

const DropdownLink = styled.a`
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  color: #1f2937;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #4338ca;
  }

  &[data-active='true'] {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
    font-weight: 600;
  }

  strong {
    font-size: 0.95rem;
    letter-spacing: -0.01em;
  }

  span {
    font-size: 0.82rem;
    color: #6b7280;
    line-height: 1.45;
  }
`;

const MainContent = styled.main`
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  gap: clamp(1.2rem, 2.4vw, 2rem);
  padding: 0 clamp(1rem, 4vw, 2.4rem) clamp(2.4rem, 4vw, 3rem);
  box-sizing: border-box;
`;

const ProductMain = styled(MainContent)`
  max-width: 960px;
  gap: clamp(1.6rem, 3vw, 2.4rem);
`;

const ProductHero = styled.section`
  display: grid;
  gap: 0.75rem;
  animation: ${fadeIn} 420ms ease-out;
`;

const ProductTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 4.4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0b1f33;
  background: linear-gradient(120deg, #312e81 0%, #7c3aed 55%, #6366f1 100%);
  -webkit-background-clip: text;
  color: transparent;
`;

const ProductSubtitle = styled.p`
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: rgba(15, 23, 42, 0.7);
  line-height: 1.7;
`;

const ProductSection = styled.section`
  background: rgba(255, 255, 255, 0.88);
  border-radius: 26px;
  padding: clamp(1.6rem, 3vw, 2.4rem);
  box-shadow: 0 18px 42px rgba(148, 163, 184, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: grid;
  gap: clamp(0.8rem, 2vw, 1.4rem);
  animation: ${fadeIn} 460ms ease-out;
`;

const SectionHeading = styled.h2`
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.7rem);
  color: #312e81;
  letter-spacing: -0.01em;
`;

const ProductParagraph = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.75;
  color: rgba(15, 23, 42, 0.78);
`;

const ProductList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.6rem;
  color: rgba(30, 41, 59, 0.82);
`;

const ProductListItem = styled.li`
  line-height: 1.7;
`;

const ProductHighlight = styled.span`
  color: #6c47ff;
  font-weight: 600;
`;

const DownloadActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`;

const Hero = styled.section`
  display: grid;
  gap: 0.75rem;
  text-align: left;
  animation: ${fadeIn} 420ms ease-out;
  max-width: 700px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
  font-weight: 600;
  font-size: 0.88rem;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.4rem, 4.8vw, 3.2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0b1f33;
  background: linear-gradient(120deg, #312e81 0%, #7c3aed 55%, #6366f1 100%);
  -webkit-background-clip: text;
  color: transparent;
`;


const ContentGrid = styled.div`
  display: grid;
  gap: clamp(1.2rem, 2.4vw, 2rem);
`;

const FormColumn = styled.div`
  display: grid;
  gap: 1.4rem;
`;

const Card = styled.section`
  background: #ffffff;
  border-radius: 26px;
  padding: 0;
  box-shadow: 0 22px 48px rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.22);
  animation: ${fadeIn} 460ms ease-out;
  position: relative;
  overflow: hidden;
  transition: transform 220ms ease, box-shadow 220ms ease;

  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 26px 52px rgba(79, 70, 229, 0.14);
    }
  }
`;

const CardBody = styled.div`
  padding: clamp(1.6rem, 2.4vw, 2.05rem);
  display: grid;
  gap: clamp(1.2rem, 2vw, 1.8rem);
  background: #ffffff;
`;

const FormHeader = styled.header`
  display: grid;
  gap: 0.35rem;
  padding: clamp(1.35rem, 2.4vw, 1.8rem) clamp(1.6rem, 3vw, 2.4rem);
  background: linear-gradient(135deg, #6d4dff 0%, #7c3aed 60%, #6366f1 100%);
  color: #fdfcff;
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: inherit;
  letter-spacing: -0.01em;
`;

const FormSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
`;

const Form = styled.form`
  display: grid;
  gap: clamp(1rem, 1.8vw, 1.6rem);
`;

const Fieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(0.85rem, 1.5vw, 1.25rem);
`;

const Legend = styled.legend`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(76, 29, 149, 0.55);
`;

const InputGroup = styled.div`
  display: grid;
  gap: 0.7rem;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.88);
`;

const HelperText = styled.span`
  font-size: 0.9rem;
  color: rgba(99, 102, 241, 0.85);
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.78rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(248, 250, 255, 0.95);
  color: #0f172a;
  font-size: 1rem;
  transition: border-color 160ms ease, box-shadow 180ms ease, background 160ms ease;

  &:hover {
    border-color: rgba(124, 58, 237, 0.5);
    background: rgba(255, 255, 255, 0.98);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(124, 58, 237, 0.8);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18);
    background: #ffffff;
  }

  &[aria-invalid='true'] {
    border-color: rgba(220, 38, 38, 0.65);
    box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const ToggleSecretButton = styled.button`
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  transition: background 160ms ease, color 160ms ease, transform 200ms ease;

  &:hover {
    background: rgba(124, 58, 237, 0.18);
    transform: translateY(-50%) translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.28);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.78rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(248, 250, 255, 0.95);
  color: #0f172a;
  font-size: 1rem;
  transition: border-color 160ms ease, box-shadow 180ms ease, background 160ms ease;

  &:hover {
    border-color: rgba(124, 58, 237, 0.5);
    background: rgba(255, 255, 255, 0.98);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(124, 58, 237, 0.8);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18);
    background: #ffffff;
  }
`;

const HelperPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(71, 85, 105, 0.88);
  background: rgba(236, 233, 254, 0.6);
  border-radius: 14px;
  padding: 0.8rem 1rem;
  line-height: 1.55;
  border: 1px solid rgba(167, 139, 250, 0.4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Accent = styled.span`
  font-weight: 600;
  color: #6d28d9;
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button`
  min-width: 148px;
  padding: 0.85rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.28);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: white;
  box-shadow: 0 18px 42px rgba(99, 102, 241, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 50px rgba(99, 102, 241, 0.28);
  }
`;

const DownloadButton = styled(PrimaryButton)`
  text-decoration: none;
`;

const SecondaryButton = styled(Button)`
  background: rgba(248, 250, 255, 0.95);
  color: #6d28d9;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: none;

  &:hover {
    transform: translateY(-2px);
    background: #ffffff;
  }
`;

const StatusMessage = styled.p`
  margin: 0;
  font-size: 0.94rem;
  color: ${(props) => (props.$status === 'success' ? '#166534' : '#b91c1c')};
  background: ${(props) =>
    props.$status === 'success'
      ? 'rgba(187, 247, 208, 0.4)'
      : 'rgba(254, 226, 226, 0.4)'};
  border: 1px solid
    ${(props) => (props.$status === 'success' ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.32)')};
  padding: 0.85rem 1.05rem;
  border-radius: 14px;
  transition: opacity 240ms ease, transform 220ms ease, padding 180ms ease, margin 180ms ease,
    width 180ms ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
`;

const ResultSection = styled.section`
  display: grid;
  gap: 1rem;
  background: rgba(236, 233, 254, 0.7);
  border: 1px solid rgba(167, 139, 250, 0.38);
  border-radius: 20px;
  padding: clamp(1.3rem, 2.4vw, 1.75rem);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
`;

const ResultHeading = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: rgba(109, 76, 255, 0.95);
`;

const ResultCodeRow = styled.div`
  display: grid;
  gap: 0.65rem;

  @media (min-width: 520px) {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
`;

const CodeDisplay = styled.code`
  font-size: clamp(1.24rem, 2.6vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.85);
  color: #5b21b6;
  border-radius: 16px;
  padding: 0.9rem 1.2rem;
  text-align: center;
  display: block;
  box-shadow: inset 0 0 0 1px rgba(124, 58, 237, 0.3);
`;

const CopyButton = styled.button`
  padding: 0.68rem 1.4rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: white;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease, background 220ms ease;
  box-shadow: 0 18px 42px rgba(99, 102, 241, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 48px rgba(99, 102, 241, 0.28);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.28);
    transform: translateY(-1px);
  }
`;

const CopyControls = styled.div`
  display: grid;
  gap: 0.35rem;
  justify-items: start;
`;

const CopyFeedback = styled.span`
  font-size: 0.9rem;
  color: rgba(124, 58, 237, 0.85);
  min-height: 1.2rem;
`;

const DetailsList = styled.dl`
  margin: 0;
  display: grid;
  gap: 0.6rem;
`;

const DetailRow = styled.div`
  display: grid;
  gap: 0.4rem;
  align-items: baseline;

  @media (min-width: 640px) {
    grid-template-columns: max-content 1fr;
    gap: 1.5rem;
  }
`;

const DetailTerm = styled.dt`
  font-weight: 600;
  color: rgba(15, 23, 42, 0.7);
`;

const DetailDescription = styled.dd`
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  color: rgba(15, 23, 42, 0.8);
  word-break: break-word;
`;

const InfoCard = styled(Card)`
  background: rgba(255, 255, 255, 0.86);
  display: grid;
  gap: 1.5rem;
`;

const InfoTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: #0b1f33;
`;

const FeatureList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.1rem;
`;

const FeatureItem = styled.li`
  display: grid;
  gap: 0.4rem;
`;

const FeatureName = styled.span`
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
`;

const FeatureDescription = styled.span`
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.6);
  line-height: 1.6;
`;

const InfoFooter = styled.div`
  display: grid;
  gap: 0.5rem;
  font-size: 0.92rem;
  color: rgba(15, 23, 42, 0.6);
`;

const VisuallyHidden = styled.span`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

const MACHINE_CODE_HEX_LENGTH = 16;

const sanitizeMachineCode = (value = '') =>
  (value || '')
    .toUpperCase()
    .replace(/[^A-F0-9]/g, '')
    .slice(0, MACHINE_CODE_HEX_LENGTH)
    .padEnd(MACHINE_CODE_HEX_LENGTH, '0');

const formatMachineCodeSegments = (hexString) =>
  hexString.match(/.{1,4}/g).join('-');

const machineCodePattern = /^[A-F0-9]{4}(-[A-F0-9]{4}){3}$/i;

const expiryOptions = [
  { value: 'permanent', label: '永久有效' },
  { value: 'year', label: '一年有效（365天）' },
  { value: 'day', label: '一天有效' },
  { value: 'custom', label: '选择具体日期' },
];

const initialFormState = {
  machineCode: '',
  secretKey: '',
  expiryOption: 'permanent',
  customDate: '',
};

const formatActivationCode = (hexString) =>
  hexString
    .slice(0, 16)
    .match(/.{1,4}/g)
    .join('-');

const fallbackHash = (payload) => {
  const base = btoa(payload)
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase();

  return (base + base).slice(0, 16);
};

const deriveActivationCode = async (machineCodeHex, secretKey, expiryToken) => {
  const formattedMachineCode = formatMachineCodeSegments(machineCodeHex);
  const encoder = new TextEncoder();
  const source = `${formattedMachineCode}::${secretKey}::${expiryToken}`;
  const data = encoder.encode(source);

  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    const hexString = hashArray
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    return formatActivationCode(hexString);
  }

  const fallback = fallbackHash(String.fromCharCode(...data));
  return formatActivationCode(fallback);
};

const navigationItems = [
  {
    label: '产品介绍',
    type: 'dropdown',
    children: [
      {
        label: "i2 Analyst's Notebook",
        description: '面向情报分析的可视化研判平台',
        page: 'analystsNotebook',
      },
      {
        label: 'i2 iBase 数据库',
        description: '结构化情报存储与协作数据底座',
        page: 'ibaseDatabase',
      },
    ],
  },
  { label: '激活中心', page: 'activation' },
  { label: '支持服务' },
  { label: '版本日志' },
];

const featureHighlights = [
  {
    title: '精准授权策略',
    description: '按需定义有效期与密钥策略，保障企业级分发的灵活性与安全性。',
  },
  {
    title: '即时反馈体验',
    description: '流畅的交互与视觉回馈，让激活流程保持优雅且高效。',
  },
  {
    title: '审计级记录',
    description: '生成历史一目了然，便于团队追踪每一次授权变更。',
  },
];

const pageHashMap = {
  activation: '#activation',
  analystsNotebook: '#products/analysts-notebook',
  ibaseDatabase: '#products/ibase-database',
};

const productPages = new Set(['analystsNotebook', 'ibaseDatabase']);

const resolvePageFromHash = (hash = '') => {
  const normalized = hash.replace(/^#/, '');

  switch (normalized) {
    case 'products/analysts-notebook':
      return 'analystsNotebook';
    case 'products/ibase-database':
      return 'ibaseDatabase';
    case 'activation':
      return 'activation';
    default:
      return 'activation';
  }
};


function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showSecret, setShowSecret] = useState(false);
  const [status, setStatus] = useState(null);
  const [activation, setActivation] = useState(null);
  const [copyMessage, setCopyMessage] = useState(null);
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== 'undefined') {
      return resolvePageFromHash(window.location.hash);
    }
    return 'activation';
  });
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const productMenuCloseTimer = useRef(null);

  const clearProductMenuTimer = () => {
    if (productMenuCloseTimer.current) {
      clearTimeout(productMenuCloseTimer.current);
      productMenuCloseTimer.current = null;
    }
  };

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const errorMessages = {
    machineCode: '请输入格式为 XXXX-XXXX-XXXX-XXXX 的机器码（仅限数字和大写字母）。',
    secretKey: '请输入有效的 SECRET_KEY，至少 8 位字符。',
    customDate: '请选择晚于今天的到期日期。',
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!window.location.hash) {
      window.location.hash = pageHashMap.activation;
    }

    const handleHashChange = () => {
      setActivePage(resolvePageFromHash(window.location.hash));
      setIsProductMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateToPage = (page) => {
    if (!page) {
      return;
    }

    setActivePage(page);
    setIsProductMenuOpen(false);

    if (typeof window !== 'undefined') {
      const targetHash = pageHashMap[page] || pageHashMap.activation;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  };

  const handleNavigate = (page) => (event) => {
    event.preventDefault();
    navigateToPage(page);
  };

  const handlePlaceholderClick = (event) => {
    event.preventDefault();
  };

  const openProductMenu = () => {
    clearProductMenuTimer();
    setIsProductMenuOpen(true);
  };

  const closeProductMenu = () => {
    clearProductMenuTimer();
    setIsProductMenuOpen(false);
  };

  const scheduleProductMenuClose = () => {
    clearProductMenuTimer();
    productMenuCloseTimer.current = setTimeout(() => {
      setIsProductMenuOpen(false);
      productMenuCloseTimer.current = null;
    }, 180);
  };
  const handleDropdownMouseLeave = (event) => {
    const { relatedTarget } = event;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      scheduleProductMenuClose();
    }
  };
  const toggleProductMenu = (event) => {
    event.preventDefault();
    if (isProductMenuOpen) {
      scheduleProductMenuClose();
    } else {
      openProductMenu();
    }
  };

  const handleDropdownBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeProductMenu();
    }
  };

  const isProductPage = productPages.has(activePage);
  const showProductMenu = isProductMenuOpen || isProductPage;

  const validateField = (name, value, data = formData) => {
    switch (name) {
      case 'machineCode':
        return machineCodePattern.test(value.trim()) ? '' : errorMessages.machineCode;
      case 'secretKey':
        return value.trim().length >= 8 ? '' : errorMessages.secretKey;
      case 'customDate':
        if (data.expiryOption !== 'custom') return '';
        return value && value >= minDate ? '' : errorMessages.customDate;
      default:
        return '';
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'machineCode'
        ? formatMachineCodeSegments(sanitizeMachineCode(value))
        : value;

    const nextData = { ...formData, [name]: nextValue };
    setFormData(nextData);

    if (errors[name]) {
      const validationError = validateField(name, nextValue, nextData);
      setErrors((prev) => ({ ...prev, [name]: validationError }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const validationError = validateField(name, value);
    if (validationError) {
      setErrors((prev) => ({ ...prev, [name]: validationError }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationResults = Object.entries(formData).reduce((acc, [field, fieldValue]) => {
      const error = validateField(field, fieldValue);
      if (error) {
        acc[field] = error;
      }
      return acc;
    }, {});

    if (Object.keys(validationResults).length) {
      setErrors(validationResults);
      setStatus({ type: 'error', message: '请检查表单信息，确保所有字段均已正确填写。' });
      setActivation(null);
      return;
    }

    const now = new Date();
    let expiryToken = 'permanent';
    let resolvedDate = '';
    let expiresOnLabel = '永久有效（无固定日期）';

    switch (formData.expiryOption) {
      case 'year': {
        const next = new Date(now);
        next.setDate(next.getDate() + 365);
        resolvedDate = next.toISOString().split('T')[0];
        expiryToken = resolvedDate;
        expiresOnLabel = `${resolvedDate} (一年有效)`;
        break;
      }
      case 'day': {
        const next = new Date(now);
        next.setDate(next.getDate() + 1);
        resolvedDate = next.toISOString().split('T')[0];
        expiryToken = resolvedDate;
        expiresOnLabel = `${resolvedDate} (一天有效)`;
        break;
      }
      case 'custom': {
        resolvedDate = formData.customDate;
        expiryToken = formData.customDate;
        expiresOnLabel = `${formData.customDate} (指定日期)`;
        break;
      }
      default:
        break;
    }

    try {
      setCopyMessage(null);
      const machineCodeHex = sanitizeMachineCode(formData.machineCode);
      const formattedMachineCode = formatMachineCodeSegments(machineCodeHex);
      const secretKeyValue = formData.secretKey.trim();

      const activationCode = await deriveActivationCode(
        machineCodeHex,
        secretKeyValue,
        expiryToken
      );

      setActivation({
        code: activationCode,
        machineCode: formattedMachineCode,
        secretKey: secretKeyValue,
        expiresOn: resolvedDate,
        expiryLabel: expiresOnLabel,
      });

      setStatus({ type: 'success', message: '激活码已生成，可继续后续流程。' });
    } catch (error) {
      console.error('Failed to generate activation code', error);
      setStatus({ type: 'error', message: '生成激活码时出现问题，请稍后重试。' });
      setActivation(null);
      setCopyMessage(null);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setStatus(null);
    setActivation(null);
    setCopyMessage(null);
  };

  const handleCopy = async () => {
    if (!activation?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activation.code);
      setCopyMessage('激活码已复制到剪贴板。');
    } catch (error) {
      console.error('Failed to copy activation code', error);
      setCopyMessage('复制失败，请手动复制。');
    }
  };

  const activeHelper = useMemo(() => {
    switch (formData.expiryOption) {
      case 'permanent':
        return '密钥将被设置为永久有效，适用于不需要过期控制的场景。';
      case 'year':
        return '到期时间将自动延长 365 天，适用于年度订阅。';
      case 'day':
        return '仅授予 24 小时使用权限，可用于临时授权。';
      case 'custom':
        return '选择一个具体日期，为客户提供个性化的有效期设置。';
      default:
        return '';
    }
  }, [formData.expiryOption]);

  const renderActivationCenter = () => (
    <MainContent>
      <Hero>
        <HeroBadge>
          <span aria-hidden='true'>●</span>
          ibm ibase 激活码授权
        </HeroBadge>
        <HeroTitle>iBase 激活中心</HeroTitle>
      </Hero>

      <ContentGrid>
        <FormColumn>
          <Card aria-labelledby='license-config-title'>
            <FormHeader>
              <FormTitle id='license-config-title'>激活参数配置</FormTitle>
              <FormSubtitle>
                输入机器码与 SECRET_KEY，灵活选择有效期策略。每一步操作都将实时反馈，保障授权流程的透明与可靠。
              </FormSubtitle>
            </FormHeader>
            <CardBody>
              <Form onSubmit={handleSubmit} noValidate>
                <Fieldset>
                  <Legend>基础信息</Legend>
                  <InputGroup>
                    <LabelRow>
                      <Label htmlFor='machineCode'>机器码</Label>
                      <HelperText>示例：D977-B6F1-7EE3-1675</HelperText>
                    </LabelRow>
                    <TextInput
                      id='machineCode'
                      name='machineCode'
                      type='text'
                      placeholder='XXXX-XXXX-XXXX-XXXX'
                      inputMode='text'
                      value={formData.machineCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={errors.machineCode ? 'machineCode-error' : undefined}
                      aria-invalid={Boolean(errors.machineCode)}
                      required
                      autoComplete='off'
                    />
                    {errors.machineCode && (
                      <ErrorMessage id='machineCode-error' role='alert'>
                        {errors.machineCode}
                      </ErrorMessage>
                    )}
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor='secretKey'>SECRET_KEY</Label>
                    <PasswordInputWrapper>
                      <TextInput
                        id='secretKey'
                        name='secretKey'
                        type={showSecret ? 'text' : 'password'}
                        placeholder='输入密钥'
                        value={formData.secretKey}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-describedby={errors.secretKey ? 'secretKey-error' : undefined}
                        aria-invalid={Boolean(errors.secretKey)}
                        required
                      />
                      <ToggleSecretButton
                        type='button'
                        onClick={() => setShowSecret((prev) => !prev)}
                        aria-label={showSecret ? '隐藏 SECRET_KEY' : '显示 SECRET_KEY'}
                      >
                        {showSecret ? '隐藏' : '显示'}
                      </ToggleSecretButton>
                    </PasswordInputWrapper>
                    {errors.secretKey && (
                      <ErrorMessage id='secretKey-error' role='alert'>
                        {errors.secretKey}
                      </ErrorMessage>
                    )}
                  </InputGroup>
                </Fieldset>

                <Fieldset>
                  <Legend>到期策略</Legend>
                  <InputGroup>
                    <Label htmlFor='expiryOption'>到期类型</Label>
                    <Select
                      id='expiryOption'
                      name='expiryOption'
                      value={formData.expiryOption}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {expiryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </InputGroup>
                  {formData.expiryOption === 'custom' && (
                    <InputGroup>
                      <Label htmlFor='customDate'>选择到期日期</Label>
                      <TextInput
                        id='customDate'
                        name='customDate'
                        type='date'
                        min={minDate}
                        value={formData.customDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-describedby={errors.customDate ? 'customDate-error' : undefined}
                        aria-invalid={Boolean(errors.customDate)}
                        required
                      />
                      {errors.customDate && (
                        <ErrorMessage id='customDate-error' role='alert'>
                          {errors.customDate}
                        </ErrorMessage>
                      )}
                    </InputGroup>
                  )}
                  <HelperPanel>
                    <Accent>提示：</Accent>
                    <span>{activeHelper}</span>
                  </HelperPanel>
                </Fieldset>

                <ButtonRow>
                  <SecondaryButton type='button' onClick={handleReset}>
                    重置
                  </SecondaryButton>
                  <PrimaryButton type='submit'>生成激活码</PrimaryButton>
                </ButtonRow>

                {status && (
                  <StatusMessage role='status' $status={status.type}>
                    {status.message}
                  </StatusMessage>
                )}

                {activation && (
                  <ResultSection aria-live='polite'>
                    <ResultHeading>激活码已就绪</ResultHeading>
                    <ResultCodeRow>
                      <CodeDisplay>{activation.code}</CodeDisplay>
                      <CopyControls>
                        <CopyButton type='button' onClick={handleCopy}>
                          复制激活码
                        </CopyButton>
                        {copyMessage && (
                          <CopyFeedback role='status' aria-live='polite'>
                            {copyMessage}
                          </CopyFeedback>
                        )}
                      </CopyControls>
                    </ResultCodeRow>
                    <DetailsList>
                      <DetailRow>
                        <DetailTerm>机器码</DetailTerm>
                        <DetailDescription>{activation.machineCode}</DetailDescription>
                      </DetailRow>
                      <DetailRow>
                        <DetailTerm>SECRET_KEY</DetailTerm>
                        <DetailDescription>
                          <VisuallyHidden>密钥</VisuallyHidden>
                          {activation.secretKey}
                        </DetailDescription>
                      </DetailRow>
                      <DetailRow>
                        <DetailTerm>到期信息</DetailTerm>
                        <DetailDescription>
                          {activation.expiresOn ? activation.expiryLabel : '永久有效'}
                        </DetailDescription>
                      </DetailRow>
                    </DetailsList>
                  </ResultSection>
                )}
              </Form>
            </CardBody>
          </Card>
        </FormColumn>

        <InfoCard aria-labelledby='activation-highlights-title'>
          <CardBody>
            <InfoTitle id='activation-highlights-title'>平台亮点</InfoTitle>
            <FeatureList>
              {featureHighlights.map((feature) => (
                <FeatureItem key={feature.title}>
                  <FeatureName>{feature.title}</FeatureName>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureItem>
              ))}
            </FeatureList>
            <InfoFooter>
              <span>实时生成的激活记录可追溯、可导出，适用于严格审计环境。</span>
              <span>与 iBase 数据库深度结合，实现授权信息与业务数据的同步管理。</span>
            </InfoFooter>
          </CardBody>
        </InfoCard>
      </ContentGrid>
    </MainContent>
  );

  const renderAnalystsNotebook = () => (
    <ProductMain>
      <ProductHero>
        <HeroBadge>
          <span aria-hidden='true'>◆</span>
          产品介绍
        </HeroBadge>
        <ProductTitle>i2 Analyst's Notebook</ProductTitle>
        <ProductSubtitle>📊 i2 Analyst's Notebook：高级可视化分析工具</ProductSubtitle>
        <ProductSubtitle>
          i2 Analyst's Notebook 是一款用于调查和情报分析的高级可视化分析工具，广泛应用于打击犯罪、恐怖主义和欺诈活动。
        </ProductSubtitle>
        <DownloadActions>
          <DownloadButton as='a' href='#' onClick={(event) => event.preventDefault()}>
            下载产品资料
          </DownloadButton>
          <HelperText as='span'>可在此处替换为正式的下载链接。</HelperText>
        </DownloadActions>
      </ProductHero>

      <ProductSection>
        <SectionHeading>核心功能</SectionHeading>
        <ProductParagraph>
          核心功能覆盖数据建模、可视化分析、查询过滤以及成果共享，帮助分析员全面掌握线索并快速输出决策建议。
        </ProductParagraph>
        <ProductList>
          <ProductListItem>
            <ProductHighlight>数据建模与可视化：</ProductHighlight> 支持将数据以实体、链接、事件、时间线或属性的形式进行建模和可视化，帮助分析复杂场景。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>灵活的数据采集：</ProductHighlight> 通过直观的拖放方式简化手动数据输入，支持多种数据源的连接和查询。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>图表创建与分析：</ProductHighlight> 用户可以创建图表，分析实体之间的关系，发现潜在的联系和趋势。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>地理空间分析：</ProductHighlight> 支持将数据映射到地图上，进行地理空间分析，识别地理分布和模式。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>时间序列分析：</ProductHighlight> 通过时间线功能，分析事件的时间顺序，揭示时间上的关联性。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>高级查询与过滤：</ProductHighlight> 提供强大的查询工具，支持复杂的查询条件，快速筛选和分析数据。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>报告与共享：</ProductHighlight> 生成可视化报告，支持与团队成员共享分析结果，促进协作。
          </ProductListItem>
        </ProductList>
        <ProductParagraph>
          i2 Analyst's Notebook 已被全球超过 2,000 个组织使用，帮助用户将复杂的数据转化为可操作的情报。
        </ProductParagraph>
      </ProductSection>
    </ProductMain>
  );

  const renderIBaseDatabase = () => (
    <ProductMain>
      <ProductHero>
        <HeroBadge>
          <span aria-hidden='true'>◆</span>
          产品介绍
        </HeroBadge>
        <ProductTitle>i2 iBase 数据库</ProductTitle>
        <ProductSubtitle>🗃️ i2 iBase：数据库与建模分析工具</ProductSubtitle>
        <ProductSubtitle>
          i2 iBase 是一款数据库和建模分析工具，用于配置、捕获、控制、分析和展示复杂的信息和关系，广泛应用于情报分析和调查工作。
        </ProductSubtitle>
        <DownloadActions>
          <DownloadButton as='a' href='#' onClick={(event) => event.preventDefault()}>
            下载产品资料
          </DownloadButton>
          <HelperText as='span'>点击按钮即可替换为最终的下载地址。</HelperText>
        </DownloadActions>
      </ProductHero>

      <ProductSection>
        <SectionHeading>核心功能</SectionHeading>
        <ProductParagraph>
          iBase 提供完善的数据建模、查询分析与安全审计能力，是构建情报数据库和管理复杂关系网络的理想平台。
        </ProductParagraph>
        <ProductList>
          <ProductListItem>
            <ProductHighlight>数据录入与管理：</ProductHighlight> 支持添加、修改、删除记录，导入和导出数据，方便管理数据库中的信息。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>实体与链接建模：</ProductHighlight> 基于实体和链接的概念，表示事物及其关系，支持对数据进行建模和分析。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>集合与查询：</ProductHighlight> 通过创建集合和查询，分析数据中的共同成员，发现潜在的联系。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>可视化查询：</ProductHighlight> 提供强大的可视化查询工具，支持构建简单或复杂的查询，揭示数据库中的信息。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>报告功能：</ProductHighlight> 使用灵活的报告工具，对数据进行报告，生成可视化的分析结果。
          </ProductListItem>
          <ProductListItem>
            <ProductHighlight>安全性与集成：</ProductHighlight> 支持高级安全性功能，能够与其他产品（如 i2 Analyst's Notebook）和第三方映射应用程序集成，扩展分析能力。
          </ProductListItem>
        </ProductList>
      </ProductSection>
    </ProductMain>
  );

  const renderMainSection = () => {
    if (activePage === 'analystsNotebook') {
      return renderAnalystsNotebook();
    }

    if (activePage === 'ibaseDatabase') {
      return renderIBaseDatabase();
    }

    return renderActivationCenter();
  };

  useEffect(() => () => clearProductMenuTimer(), []);

  return (
    <Shell>
      <Header>
        <Bar>
          <Brand>
            <span className='logo' aria-hidden='true'>
              iB
            </span>
            <div className='tt'>
              <span className='title'>iBase Activation Studio</span>
              <span className='sub'>专业激活管理平台</span>
            </div>
          </Brand>
          <Nav aria-label='主导航'>
            <NavMenu>
              {navigationItems.map((item) => {
                if (item.type === 'dropdown') {
                  return (
                    <NavItem
                      key={item.label}
                      onMouseEnter={openProductMenu}
                      onMouseLeave={handleDropdownMouseLeave}
                      onFocus={openProductMenu}
                      onBlur={handleDropdownBlur}
                    >
                      <DropdownToggle
                        type='button'
                        data-open={showProductMenu ? 'true' : undefined}
                        data-active={isProductPage ? 'true' : undefined}
                        aria-haspopup='true'
                        aria-expanded={showProductMenu}
                        onClick={toggleProductMenu}
                      >
                        {item.label}
                      </DropdownToggle>
                      <DropdownMenu
                        $open={showProductMenu}
                        onMouseEnter={openProductMenu}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        {item.children.map((child) => (
                          <DropdownLink
                            key={child.label}
                            href={pageHashMap[child.page] || '#'}
                            data-active={activePage === child.page ? 'true' : undefined}
                            onClick={handleNavigate(child.page)}
                          >
                            <strong>{child.label}</strong>
                            <span>{child.description}</span>
                          </DropdownLink>
                        ))}
                      </DropdownMenu>
                    </NavItem>
                  );
                }

                return (
                  <NavItem key={item.label}>
                    <NavLinkStyled
                      href={item.page ? pageHashMap[item.page] || pageHashMap.activation : '#'}
                      data-active={item.page && activePage === item.page ? 'true' : undefined}
                      onClick={item.page ? handleNavigate(item.page) : handlePlaceholderClick}
                    >
                      {item.label}
                    </NavLinkStyled>
                  </NavItem>
                );
              })}
            </NavMenu>
          </Nav>
          <CTA type='button'>联系我们</CTA>
        </Bar>
      </Header>

      {renderMainSection()}
    </Shell>
  );
}

export default App;
