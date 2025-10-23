import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Canvas = styled.main`
  width: min(1200px, 100%);
  display: grid;
  gap: clamp(2.5rem, 6vw, 4rem);
  color: #0b1120;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.75rem, 2vw, 1.2rem) clamp(1rem, 2vw, 1.5rem);
  background: rgba(255, 255, 255, 0.75);
  border-radius: 24px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
  animation: ${fadeInUp} 420ms ease-out;
`;

const Brand = styled.div`
  font-weight: 600;
  font-size: clamp(1.05rem, 3vw, 1.3rem);
  letter-spacing: 0.02em;
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
`;

const NavItem = styled.a`
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.65);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  transition: color 200ms ease, background 200ms ease, transform 220ms ease;

  &:hover,
  &:focus-visible {
    color: rgba(15, 23, 42, 0.88);
    background: rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
    outline: none;
  }
`;

const Hero = styled.section`
  display: grid;
  gap: clamp(1.25rem, 3vw, 1.9rem);
  padding: clamp(0.5rem, 3vw, 1rem) clamp(1rem, 4vw, 1.75rem) 0;
  animation: ${fadeInUp} 520ms ease-out;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #020617;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  max-width: 720px;
  font-size: clamp(1.05rem, 2.5vw, 1.2rem);
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.64);
`;

const ContentGrid = styled.section`
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: start;
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 32px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
  padding: clamp(2rem, 4vw, 3rem);
  display: grid;
  gap: clamp(1.75rem, 3vw, 2.5rem);
  animation: ${fadeInUp} 620ms ease-out;
  transition: transform 220ms ease, box-shadow 220ms ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 32px 70px rgba(15, 23, 42, 0.12);
  }
`;

const CardHeading = styled.header`
  display: grid;
  gap: 0.5rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.45rem, 3vw, 1.85rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #020617;
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(15, 23, 42, 0.58);
`;

const Form = styled.form`
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.25rem);
`;

const FieldBlock = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #0b1120;
`;

const LabelHint = styled.span`
  font-size: 0.9rem;
  color: rgba(37, 99, 235, 0.75);
`;

const InputShell = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.1rem;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.92);
  font-size: 1rem;
  color: #0b1120;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;

  &:hover {
    border-color: rgba(37, 99, 235, 0.45);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(37, 99, 235, 0.7);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);
    transform: translateY(-1px);
  }

  &[aria-invalid='true'] {
    border-color: rgba(220, 38, 38, 0.7);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.22);
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: rgba(37, 99, 235, 0.85);
  font-weight: 600;
  cursor: pointer;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  transition: background 160ms ease, color 160ms ease;

  &:hover,
  &:focus-visible {
    background: rgba(37, 99, 235, 0.12);
    color: rgba(37, 99, 235, 1);
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem 1.1rem;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.92);
  font-size: 1rem;
  color: #0b1120;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;

  &:hover {
    border-color: rgba(37, 99, 235, 0.45);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(37, 99, 235, 0.7);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);
    transform: translateY(-1px);
  }
`;

const HelperNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.92rem;
  color: rgba(15, 23, 42, 0.65);
  background: rgba(37, 99, 235, 0.08);
  border-radius: 18px;
  padding: 0.85rem 1.1rem;
`;

const Accent = styled.span`
  font-weight: 600;
  color: rgba(37, 99, 235, 0.9);
`;

const ErrorText = styled.span`
  color: #d92d20;
  font-size: 0.88rem;
  line-height: 1.45;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button`
  min-width: 160px;
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 50%, #93c5fd 100%);
  color: white;
  box-shadow: 0 24px 48px rgba(37, 99, 235, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 28px 60px rgba(37, 99, 235, 0.32);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.9);
  color: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);

  &:hover {
    transform: translateY(-2px);
    background: white;
    box-shadow: 0 24px 52px rgba(15, 23, 42, 0.16);
  }
`;

const StatusBanner = styled.p`
  margin: 0;
  font-size: 0.95rem;
  border-radius: 18px;
  padding: 0.85rem 1rem;
  border: 1px solid
    ${(props) =>
      props.$status === 'success' ? 'rgba(34, 197, 94, 0.32)' : 'rgba(220, 38, 38, 0.26)'};
  background:
    ${(props) =>
      props.$status === 'success' ? 'rgba(34, 197, 94, 0.14)' : 'rgba(248, 113, 113, 0.18)'};
  color: ${(props) => (props.$status === 'success' ? '#166534' : '#b42318')};
`;

const PreviewPanel = styled(Card)`
  background: rgba(255, 255, 255, 0.88);
  animation-delay: 80ms;
`;

const PreviewHeader = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #020617;
`;

const PreviewMeta = styled.span`
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.55);
`;

const CodeBadge = styled.code`
  display: block;
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  border-radius: 20px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.18);
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: clamp(1.3rem, 3vw, 1.55rem);
  letter-spacing: 0.32em;
  text-align: center;
  color: #1d4ed8;
`;

const DetailList = styled.dl`
  margin: 0;
  display: grid;
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: grid;
  gap: 0.35rem;

  @media (min-width: 640px) {
    grid-template-columns: 160px 1fr;
    align-items: baseline;
    gap: 1.5rem;
  }
`;

const DetailTerm = styled.dt`
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.6);
`;

const DetailDescription = styled.dd`
  margin: 0;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.9);
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

const formatMachineCodeSegments = (hexString) => hexString.match(/.{1,4}/g).join('-');

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
    let nextValue = value;

    if (name === 'machineCode') {
      const sanitized = sanitizeMachineCode(value);
      nextValue = formatMachineCodeSegments(sanitized);
    }

    const nextState = {
      ...formData,
      [name]: nextValue,
    };

    if (name === 'expiryOption' && value !== 'custom') {
      nextState.customDate = '';
    }

    setFormData(nextState);

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValue, nextState),
      }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const message = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentErrors = Object.keys(formData).reduce((acc, field) => {
      const message = validateField(field, formData[field]);
      if (message) acc[field] = message;
      return acc;
    }, {});

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      setStatus({ type: 'error', message: '请检查表单信息后再次提交。' });
      return;
    }

    const now = new Date();
    let expiryToken = 'permanent';
    let resolvedDate = null;
    let expiresOnLabel = '永久授权';

    switch (formData.expiryOption) {
      case 'permanent':
        break;
      case 'year': {
        const next = new Date(now);
        next.setFullYear(next.getFullYear() + 1);
        resolvedDate = next.toISOString().split('T')[0];
        expiresOnLabel = `${resolvedDate} (一年有效)`;
        expiryToken = resolvedDate;
        break;
      }
      case 'day': {
        const next = new Date(now);
        next.setDate(next.getDate() + 1);
        resolvedDate = next.toISOString().split('T')[0];
        expiresOnLabel = `${resolvedDate} (一天有效)`;
        expiryToken = resolvedDate;
        break;
      }
      case 'custom': {
        resolvedDate = formData.customDate;
        expiresOnLabel = `${formData.customDate} (指定日期)`;
        expiryToken = formData.customDate;
        break;
      }
      default:
        break;
    }

    try {
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
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setStatus(null);
    setActivation(null);
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
    <Canvas>
      <Navigation aria-label="主导航">
        <Brand>License Studio</Brand>
        <NavGroup>
          <NavItem href="#config">配置</NavItem>
          <NavItem href="#preview">预览</NavItem>
          <NavItem href="#support">支持</NavItem>
        </NavGroup>
      </Navigation>

      <Hero>
        <HeroTitle>极致简洁的许可证配置体验</HeroTitle>
        <HeroSubtitle>
          以现代化的流程，快速生成安全可信的激活码。轻盈的界面配合顺滑的交互，助您在每一次授权中保持专业与优雅。
        </HeroSubtitle>
      </Hero>

      <ContentGrid>
        <Card id="config" aria-labelledby="config-title">
          <CardHeading>
            <CardTitle id="config-title">激活信息</CardTitle>
            <CardSubtitle>填写机器码与密钥，定制最适配的到期策略。</CardSubtitle>
          </CardHeading>
          <Form onSubmit={handleSubmit} noValidate>
            <FieldBlock>
              <LabelRow>
                <Label htmlFor="machineCode">机器码</Label>
                <LabelHint>示例：D977-B6F1-7EE3-1675</LabelHint>
              </LabelRow>
              <Input
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
                <ErrorText id="machineCode-error" role="alert">
                  {errors.machineCode}
                </ErrorText>
              )}
            </FieldBlock>

            <FieldBlock>
              <Label htmlFor="secretKey">SECRET_KEY</Label>
              <InputShell>
                <Input
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
                <ToggleButton
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  aria-pressed={showSecret}
                >
                  {showSecret ? '隐藏' : '显示'}
                </ToggleButton>
              </InputShell>
              {errors.secretKey && (
                <ErrorText id="secretKey-error" role="alert">
                  {errors.secretKey}
                </ErrorText>
              )}
            </FieldBlock>

            <FieldBlock>
              <Label htmlFor="expiryOption">有效期</Label>
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
            </FieldBlock>

            {formData.expiryOption === 'custom' && (
              <FieldBlock>
                <Label htmlFor="customDate">到期日期</Label>
                <Input
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
                  <ErrorText id="customDate-error" role="alert">
                    {errors.customDate}
                  </ErrorText>
                )}
              </FieldBlock>
            )}

            <HelperNote>
              <Accent>智能提示：</Accent>
              <span>{activeHelper}</span>
            </HelperNote>

            {status && (
              <StatusBanner role="status" $status={status.type}>
                {status.message}
              </StatusBanner>
            )}

            <ButtonRow>
              <SecondaryButton type="button" onClick={handleReset}>
                重置
              </SecondaryButton>
              <PrimaryButton type="submit">生成激活码</PrimaryButton>
            </ButtonRow>
          </Form>
        </Card>

        <PreviewPanel id="preview" aria-labelledby="preview-title">
          <CardHeading>
            <PreviewHeader>
              <PreviewTitle id="preview-title">激活预览</PreviewTitle>
              <PreviewMeta>实时呈现当前配置的激活信息。</PreviewMeta>
            </PreviewHeader>
          </CardHeading>

          {activation ? (
            <>
              <VisuallyHidden>激活码</VisuallyHidden>
              <CodeBadge>{activation.code}</CodeBadge>
              <DetailList>
                <DetailItem>
                  <DetailTerm>机器码</DetailTerm>
                  <DetailDescription>{activation.machineCode}</DetailDescription>
                </DetailItem>
                <DetailItem>
                  <DetailTerm>SECRET_KEY</DetailTerm>
                  <DetailDescription>{activation.secretKey}</DetailDescription>
                </DetailItem>
                <DetailItem>
                  <DetailTerm>到期策略</DetailTerm>
                  <DetailDescription>
                    {activation.expiryLabel}
                    {activation.expiresOn ? '' : '（永久）'}
                  </DetailDescription>
                </DetailItem>
                {activation.expiresOn && (
                  <DetailItem>
                    <DetailTerm>到期日期</DetailTerm>
                    <DetailDescription>{activation.expiresOn}</DetailDescription>
                  </DetailItem>
                )}
              </DetailList>
            </>
          ) : (
            <DetailList>
              <DetailItem>
                <DetailTerm>机器码</DetailTerm>
                <DetailDescription>等待输入...</DetailDescription>
              </DetailItem>
              <DetailItem>
                <DetailTerm>SECRET_KEY</DetailTerm>
                <DetailDescription>待录入</DetailDescription>
              </DetailItem>
              <DetailItem>
                <DetailTerm>到期策略</DetailTerm>
                <DetailDescription>请选择或使用默认策略</DetailDescription>
              </DetailItem>
            </DetailList>
          )}
        </PreviewPanel>
      </ContentGrid>

      <footer id="support">
        <VisuallyHidden>页脚</VisuallyHidden>
      </footer>
    </Canvas>
  );
}

export default App;
