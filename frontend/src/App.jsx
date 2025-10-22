import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const cardEntrance = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const PageWrapper = styled.main`
  width: min(880px, 100%);
  margin: 0 auto;
  color: #0f172a;
`;

const GlassCard = styled.section`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.86), rgba(244, 245, 255, 0.78));
  border-radius: 28px;
  padding: clamp(2rem, 4vw, 3.5rem);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  animation: ${cardEntrance} 420ms ease-out;

  @media (max-width: 640px) {
    padding: 1.75rem 1.25rem;
    border-radius: 22px;
  }
`;

const Header = styled.header`
  margin-bottom: clamp(2rem, 4vw, 3rem);
`;

const Title = styled.h1`
  font-size: clamp(2rem, 3.5vw, 2.85rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 0 0.5rem;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 0;
  color: rgba(15, 23, 42, 0.68);
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.6;
`;

const Form = styled.form`
  display: grid;
  gap: clamp(1.75rem, 3vw, 2.5rem);
`;

const Fieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(1.25rem, 2vw, 1.75rem);
`;

const Legend = styled.legend`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.58);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const InputGroup = styled.div`
  display: grid;
  gap: 0.65rem;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
`;

const HelperText = styled.span`
  font-size: 0.9rem;
  color: rgba(79, 70, 229, 0.85);
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.95rem 1.05rem;
  border-radius: 16px;
  border: 1.5px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 1rem;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.55);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(99, 102, 241, 0.75);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
    transform: translateY(-1px);
  }

  &[aria-invalid='true'] {
    border-color: rgba(220, 38, 38, 0.7);
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.35);
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const ToggleSecretButton = styled.button`
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: rgba(79, 70, 229, 0.9);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 10px;
  transition: background 160ms ease;

  &:hover {
    background: rgba(99, 102, 241, 0.12);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.95rem 1.05rem;
  border-radius: 16px;
  border: 1.5px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 1rem;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.55);
  }

  &:focus-visible {
    outline: none;
    border-color: rgba(99, 102, 241, 0.75);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
    transform: translateY(-1px);
  }
`;

const HelperPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.92rem;
  color: rgba(15, 23, 42, 0.7);
  background: rgba(99, 102, 241, 0.08);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  line-height: 1.5;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Accent = styled.span`
  font-weight: 600;
  color: #4f46e5;
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 0.88rem;
  line-height: 1.4;
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
  min-width: 150px;
  padding: 0.9rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: transform 180ms ease, box-shadow 180ms ease, background 200ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 18px 36px rgba(79, 70, 229, 0.18);

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.35);
    transform: translateY(-1px) scale(0.99);
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(120deg, #6366f1, #8b5cf6 48%, #a855f7);
  color: white;

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 18px 36px rgba(99, 102, 241, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.8);
  color: #4f46e5;
  border: 1.5px solid rgba(99, 102, 241, 0.25);
  box-shadow: 0 16px 30px rgba(99, 102, 241, 0.14);

  &:hover {
    transform: translateY(-2px) scale(1.01);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const StatusMessage = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${(props) => (props.$status === 'success' ? '#15803d' : '#dc2626')};
  background: ${(props) =>
    props.$status === 'success'
      ? 'rgba(34, 197, 94, 0.12)'
      : 'rgba(248, 113, 113, 0.15)'};
  border: 1px solid
    ${(props) => (props.$status === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(248, 113, 113, 0.35)')};
  padding: 0.85rem 1rem;
  border-radius: 14px;
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

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showSecret, setShowSecret] = useState(false);
  const [status, setStatus] = useState(null);

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
    const nextValue = name === 'machineCode' ? value.toUpperCase() : value;
    const updatedFormData = {
      ...formData,
      [name]: nextValue,
    };

    if (name === 'expiryOption' && value !== 'custom') {
      updatedFormData.customDate = '';
    }

    setFormData(updatedFormData);

    setErrors((prev) => {
      const nextErrors = {
        ...prev,
        [name]: validateField(name, nextValue, updatedFormData),
      };

      if (name === 'expiryOption' && value !== 'custom') {
        nextErrors.customDate = '';
      }

      return nextErrors;
    });

    setStatus(null);
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      machineCode: validateField('machineCode', formData.machineCode, formData),
      secretKey: validateField('secretKey', formData.secretKey, formData),
      customDate: validateField('customDate', formData.customDate, formData),
    };

    const filteredErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, message]) => Boolean(message))
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setStatus({ type: 'error', message: '表单存在错误，请检查红色提示后重新提交。' });
      return;
    }

    const payload = {
      ...formData,
      ...(formData.expiryOption === 'custom' && formData.customDate ? { expiresOn: formData.customDate } : {}),
    };

    // 模拟提交
    console.table(payload);
    setStatus({ type: 'success', message: '配置已准备就绪，您可以继续后续流程。' });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setStatus(null);
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
    <PageWrapper>
      <GlassCard aria-labelledby="license-config-title">
        <Header>
          <Title id="license-config-title">许可证配置面板</Title>
          <Subtitle>
            输入机器码与 SECRET_KEY，选择到期策略，打造符合现代安全标准的激活体验。
          </Subtitle>
        </Header>
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
                  autoComplete="new-password"
                  required
                />
                <ToggleSecretButton
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  aria-pressed={showSecret}
                  aria-label={showSecret ? '隐藏密钥' : '显示密钥'}
                >
                  {showSecret ? '🙈' : '👁️'}
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
            <Legend>到期时间</Legend>
            <InputGroup>
              <Label htmlFor="expiryOption">到期策略</Label>
              <Select
                id="expiryOption"
                name="expiryOption"
                value={formData.expiryOption}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="expiry-helper"
              >
                {expiryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <HelperPanel id="expiry-helper">
                <Accent>提示</Accent>
                <span>{activeHelper}</span>
              </HelperPanel>
            </InputGroup>
            {formData.expiryOption === 'custom' && (
              <InputGroup>
                <Label htmlFor="customDate">指定到期日期</Label>
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
          </Fieldset>

          {status && (
            <StatusMessage $status={status.type} role="status" aria-live="polite">
              <VisuallyHidden>{status.type === 'success' ? '成功：' : '错误：'}</VisuallyHidden>
              {status.message}
            </StatusMessage>
          )}

          <ButtonRow>
            <SecondaryButton type="button" onClick={handleReset}>
              取消
            </SecondaryButton>
            <PrimaryButton type="submit">
              确认
            </PrimaryButton>
          </ButtonRow>
        </Form>
      </GlassCard>
    </PageWrapper>
  );
}

export default App;
