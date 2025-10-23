import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Shell = styled.div`
  width: min(1120px, 100%);
  display: grid;
  gap: clamp(1.8rem, 4vw, 3rem);
  padding: clamp(0.5rem, 2vw, 1.75rem);
`;

const NavBar = styled.nav`
  width: min(1040px, 100%);
  margin: clamp(0.15rem, 0.9vw, 0.6rem) auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.7rem, 1.6vw, 1.2rem) clamp(0.9rem, 2vw, 1.4rem);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  animation: ${fadeIn} 320ms ease-out;
`;

const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #0f172a;
`;

const BrandMark = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%);
  display: grid;
  place-items: center;
  color: #312e81;
  font-weight: 700;
  font-size: 0.95rem;
`;

const NavLinks = styled.ul`
  display: flex;
  align-items: center;
  gap: clamp(1.25rem, 3vw, 2.5rem);
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 860px) {
    display: none;
  }
`;

const NavLink = styled.li`
  position: relative;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.65);
  cursor: pointer;
  transition: color 200ms ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.4rem;
    width: 100%;
    height: 2px;
    transform: scaleX(0);
    transform-origin: center;
    background: linear-gradient(90deg, #6366f1, #3b82f6);
    transition: transform 200ms ease;
  }

  &:hover {
    color: rgba(15, 23, 42, 0.9);
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const NavAction = styled.button`
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, #2563eb, #4c51bf);
  color: white;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 52px rgba(37, 99, 235, 0.32);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.28);
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 1.2rem;
  text-align: left;
  animation: ${fadeIn} 420ms ease-out;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-weight: 600;
  font-size: 0.9rem;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 3.4rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0b1f33;
`;


const ContentGrid = styled.div`
  display: grid;
  gap: clamp(1.6rem, 3.4vw, 2.6rem);
`;

const FormColumn = styled.div`
  display: grid;
  gap: 1.4rem;
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 26px;
  padding: clamp(1.6rem, 2.6vw, 2.35rem);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(26px);
  animation: ${fadeIn} 460ms ease-out;
`;

const FormHeader = styled.header`
  display: grid;
  gap: 0.55rem;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.58rem;
  color: #0b1f33;
  letter-spacing: -0.01em;
`;

const FormSubtitle = styled.p`
  margin: 0;
  font-size: 0.96rem;
  color: rgba(15, 23, 42, 0.65);
  line-height: 1.55;
`;

const Form = styled.form`
  display: grid;
  gap: clamp(1.25rem, 2.2vw, 1.9rem);
`;

const Fieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(1rem, 1.8vw, 1.4rem);
`;

const Legend = styled.legend`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.48);
`;

const InputGroup = styled.div`
  display: grid;
  gap: 0.65rem;
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
  color: rgba(15, 23, 42, 0.9);
`;

const HelperText = styled.span`
  font-size: 0.9rem;
  color: rgba(37, 99, 235, 0.82);
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.9rem 1.05rem;
  border-radius: 18px;
  border: 1.5px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 1rem;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;

  &:hover {
    border-color: rgba(37, 99, 235, 0.5);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(37, 99, 235, 0.72);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);
    transform: translateY(-1px);
  }

  &[aria-invalid='true'] {
    border-color: rgba(220, 38, 38, 0.7);
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3);
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
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: rgba(37, 99, 235, 0.14);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.28);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.9rem 1.05rem;
  border-radius: 18px;
  border: 1.5px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 1rem;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;

  &:hover {
    border-color: rgba(37, 99, 235, 0.5);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(37, 99, 235, 0.72);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);
    transform: translateY(-1px);
  }
`;

const HelperPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.7);
  background: rgba(37, 99, 235, 0.08);
  border-radius: 16px;
  padding: 0.8rem 1rem;
  line-height: 1.5;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Accent = styled.span`
  font-weight: 600;
  color: #2563eb;
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: flex-end;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button`
  min-width: 150px;
  padding: 0.9rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: transform 200ms ease, box-shadow 200ms ease, background 220ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.28);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(120deg, #2563eb, #4338ca);
  color: white;
  box-shadow: 0 22px 48px rgba(37, 99, 235, 0.24);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 30px 60px rgba(37, 99, 235, 0.32);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.88);
  color: #1d4ed8;
  border: 1.5px solid rgba(37, 99, 235, 0.16);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.08);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const StatusMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${(props) => (props.$status === 'success' ? '#166534' : '#b91c1c')};
  background: ${(props) =>
    props.$status === 'success' ? 'rgba(34, 197, 94, 0.14)' : 'rgba(248, 113, 113, 0.16)'};
  border: 1px solid
    ${(props) => (props.$status === 'success' ? 'rgba(34, 197, 94, 0.28)' : 'rgba(248, 113, 113, 0.32)')};
  padding: 0.9rem 1.1rem;
  border-radius: 16px;
`;

const ResultSection = styled.section`
  display: grid;
  gap: 1rem;
  background: rgba(13, 148, 136, 0.08);
  border: 1px solid rgba(13, 148, 136, 0.24);
  border-radius: 20px;
  padding: clamp(1.35rem, 2.6vw, 1.8rem);
`;

const ResultHeading = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0b1f33;
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
  font-size: clamp(1.32rem, 2.8vw, 1.58rem);
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  background: rgba(13, 148, 136, 0.16);
  color: #0f766e;
  border-radius: 16px;
  padding: 1rem 1.3rem;
  text-align: center;
  display: block;
  box-shadow: inset 0 0 0 1px rgba(13, 148, 136, 0.24);
`;

const CopyButton = styled.button`
  padding: 0.7rem 1.45rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  background: linear-gradient(120deg, #0f766e, #0d9488);
  color: white;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease, background 220ms ease;
  box-shadow: 0 16px 36px rgba(13, 148, 136, 0.28);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 48px rgba(13, 148, 136, 0.32);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.28);
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
  color: rgba(13, 148, 136, 0.85);
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
      <NavBar>
        <NavBrand>
          <BrandMark>IB</BrandMark>
          iBase Activation Studio
        </NavBrand>
        <NavLinks>
          {['产品简介', '激活中心', '支持服务', '版本日志'].map((item) => (
            <NavLink key={item}>{item}</NavLink>
          ))}
        </NavLinks>
        <NavAction type="button">联系我们</NavAction>
      </NavBar>

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
          </Card>
        </FormColumn>

      </ContentGrid>
    </Shell>
  );
}

export default App;
