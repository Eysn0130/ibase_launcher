import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';

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
  padding: clamp(0.2rem, 0.8vw, 0.6rem) clamp(0.3rem, 1vw, 0.85rem);
  justify-items: center;
`;

const Header = styled.header`
  position: sticky;
  top: 8px;
  z-index: 50;
  background: #ffffff;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  width: 100%;
`;

const Bar = styled.div`
  height: 64px;
  margin: 0 auto;
  width: min(1120px, 95%);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;

  @media (max-width: 720px) {
    grid-template-columns: auto 1fr;
    height: 56px;
    gap: 16px;
  }
`;

const Brand = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  align-items: center;

  .logo {
    width: 24px;
    height: 24px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6c47ff, #7b57ff);
    color: #ffffff;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: -0.02em;
  }

  .tt {
    line-height: 1.1;
    display: grid;
    gap: 2px;
  }

  .title {
    font-size: 15.5px;
    font-weight: 600;
    color: #0f172a;
  }

  .sub {
    font-size: 12px;
    color: #8a90a2;
  }
`;

const Nav = styled.nav`
  justify-self: center;
  display: flex;
  gap: 20px;

  a {
    font-size: 14px;
    color: #5b5e72;
    text-decoration: none;
    transition: color 0.16s ease;
  }

  a:hover {
    color: #23253a;
  }

  a[aria-current='page'] {
    color: #6c47ff;
    font-weight: 600;
  }

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

const MainContent = styled.main`
  width: min(1120px, 100%);
  display: grid;
  gap: clamp(1.2rem, 2.4vw, 2rem);
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
  { label: '产品简介' },
  { label: '激活中心' },
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

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showSecret, setShowSecret] = useState(false);
  const [status, setStatus] = useState(null);
  const [activation, setActivation] = useState(null);
  const [copyMessage, setCopyMessage] = useState(null);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const errorMessages = {
    machineCode: '请输入格式为 XXXX-XXXX-XXXX-XXXX 的机器码（仅限数字和大写字母）。',
    secretKey: '请输入有效的 SECRET_KEY，至少 8 位字符。',
    customDate: '请选择晚于今天的到期日期。',
  };

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

  return (
    <Shell>
      <Header>
        <Bar>
          <Brand>
            <span className="logo" aria-hidden="true">
              iB
            </span>
            <div className="tt">
              <span className="title">iBase Activation Studio</span>
              <span className="sub">专业激活管理平台</span>
            </div>
          </Brand>
          <Nav aria-label="主导航">
            {navigationItems.map(({ label }) => (
              <a
                key={label}
                href="#"
                onClick={(event) => event.preventDefault()}
                aria-current={label === '激活中心' ? 'page' : undefined}
              >
                {label}
              </a>
            ))}
          </Nav>
          <CTA type="button">联系我们</CTA>
        </Bar>
      </Header>

      <MainContent>
        <Hero>
          <HeroBadge>
            <span aria-hidden="true">●</span>
            ibm ibase 激活码授权
          </HeroBadge>
          <HeroTitle>iBase 激活中心</HeroTitle>
        </Hero>

        <ContentGrid>
        <FormColumn>
          <Card aria-labelledby="license-config-title">
            <FormHeader>
              <FormTitle id="license-config-title">激活参数配置</FormTitle>
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
                    <Label htmlFor="machineCode">机器码</Label>
                    <HelperText>示例：D977-B6F1-7EE3-1675</HelperText>
                  </LabelRow>
                  <TextInput
                    id="machineCode"
                    name="machineCode"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    inputMode="text"
                    value={formData.machineCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-describedby={errors.machineCode ? 'machineCode-error' : undefined}
                    aria-invalid={Boolean(errors.machineCode)}
                    required
                    autoComplete="off"
                  />
                  {errors.machineCode && (
                    <ErrorMessage id="machineCode-error" role="alert">
                      {errors.machineCode}
                    </ErrorMessage>
                  )}
                </InputGroup>
                <InputGroup>
                  <Label htmlFor="secretKey">SECRET_KEY</Label>
                  <PasswordInputWrapper>
                    <TextInput
                      id="secretKey"
                      name="secretKey"
                      type={showSecret ? 'text' : 'password'}
                      placeholder="输入密钥"
                      value={formData.secretKey}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={errors.secretKey ? 'secretKey-error' : undefined}
                      aria-invalid={Boolean(errors.secretKey)}
                      required
                    />
                    <ToggleSecretButton
                      type="button"
                      onClick={() => setShowSecret((prev) => !prev)}
                      aria-label={showSecret ? '隐藏 SECRET_KEY' : '显示 SECRET_KEY'}
                    >
                      {showSecret ? '隐藏' : '显示'}
                    </ToggleSecretButton>
                  </PasswordInputWrapper>
                  {errors.secretKey && (
                    <ErrorMessage id="secretKey-error" role="alert">
                      {errors.secretKey}
                    </ErrorMessage>
                  )}
                </InputGroup>
              </Fieldset>

              <Fieldset>
                <Legend>到期策略</Legend>
                <InputGroup>
                  <Label htmlFor="expiryOption">到期类型</Label>
                  <Select
                    id="expiryOption"
                    name="expiryOption"
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
                    <Label htmlFor="customDate">选择到期日期</Label>
                    <TextInput
                      id="customDate"
                      name="customDate"
                      type="date"
                      min={minDate}
                      value={formData.customDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={errors.customDate ? 'customDate-error' : undefined}
                      aria-invalid={Boolean(errors.customDate)}
                      required
                    />
                    {errors.customDate && (
                      <ErrorMessage id="customDate-error" role="alert">
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
                <SecondaryButton type="button" onClick={handleReset}>
                  重置
                </SecondaryButton>
                <PrimaryButton type="submit">生成激活码</PrimaryButton>
              </ButtonRow>

              {status && (
                <StatusMessage role="status" $status={status.type}>
                  {status.message}
                </StatusMessage>
              )}

              {activation && (
                <ResultSection aria-live="polite">
                  <ResultHeading>激活码已就绪</ResultHeading>
                  <ResultCodeRow>
                    <CodeDisplay>{activation.code}</CodeDisplay>
                    <CopyControls>
                      <CopyButton type="button" onClick={handleCopy}>
                        复制激活码
                      </CopyButton>
                      {copyMessage && (
                        <CopyFeedback role="status" aria-live="polite">
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

        </ContentGrid>
      </MainContent>
    </Shell>
  );
}

export default App;
