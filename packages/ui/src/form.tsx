import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { useUiText } from './messages.js';

interface FieldBase {
  readonly label: string;
  readonly error?: string | null | undefined;
  readonly help?: string | undefined;
  readonly required?: boolean | undefined;
}

function Frame({
  label,
  error,
  help,
  required,
  name,
  children,
}: FieldBase & { readonly name: string; readonly children: ReactNode }) {
  const text = useUiText();
  return (
    <Field.Root name={name} className="ui-field" invalid={Boolean(error)}>
      <Field.Label>
        {label}
        {required === true ? (
          <>
            <span className="ui-field-required" aria-hidden="true">
              {' *'}
            </span>
            <span className="ui-sr">{` ${text('ui.form.required')}`}</span>
          </>
        ) : null}
      </Field.Label>
      {children}
      {help ? <Field.Description className="ui-field-help">{help}</Field.Description> : null}
      <Field.Error className="ui-field-error" match={Boolean(error)} role="alert">
        {error}
      </Field.Error>
    </Field.Root>
  );
}

type InputProps = Omit<ComponentProps<'input'>, 'name'> & FieldBase & { readonly name: string };

/** Campo de texto com rótulo, ajuda e erro associados (`aria-invalid`, `aria-describedby`) e anunciados. */
export function TextField({ label, error, help, required, name, ...input }: InputProps) {
  return (
    <Frame {...{ label, error, help, required, name }}>
      <Field.Control required={required} {...input} />
    </Frame>
  );
}

type SelectProps = Omit<ComponentProps<'select'>, 'name'> &
  FieldBase & {
    readonly name: string;
    readonly options: readonly { value: string; text: string; disabled?: boolean }[];
  };

/** Seleção nativa: acessível por teclado e leitor de tela sem código a mais. */
export function SelectField({
  label,
  error,
  help,
  required,
  name,
  options,
  ...input
}: SelectProps) {
  return (
    <Frame {...{ label, error, help, required, name }}>
      <Field.Control render={<select required={required} {...input} />}>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled === true}>
            {option.text}
          </option>
        ))}
      </Field.Control>
    </Frame>
  );
}

type TextAreaProps = Omit<ComponentProps<'textarea'>, 'name'> &
  FieldBase & { readonly name: string };

export function TextAreaField({ label, error, help, required, name, ...input }: TextAreaProps) {
  return (
    <Frame {...{ label, error, help, required, name }}>
      <Field.Control render={<textarea required={required} {...input} />} />
    </Frame>
  );
}

/**
 * Legenda do asterisco (`*`) dos campos obrigatórios. Coloque uma vez, no topo do formulário: sem ela o símbolo não diz o que
 * significa (WCAG 3.3.2). O asterisco é só marca visual; o leitor de tela já ouve "obrigatório" em cada campo.
 */
export function RequiredLegend() {
  const text = useUiText();
  return <p className="ui-required-legend">{text('ui.form.requiredLegend')}</p>;
}

export interface FormErrorItem {
  /** Nome do campo (o `name` do controle) que recebe o foco ao clicar. */
  readonly field: string;
  readonly message: string;
}

/**
 * Resumo de erros no topo do formulário depois de uma tentativa de envio: recebe o foco, diz quantos campos precisam de
 * correção e leva a cada um por um link. Complementa (não substitui) o erro junto de cada campo.
 */
export function FormErrorSummary({
  errors,
  title,
}: {
  readonly errors: readonly FormErrorItem[];
  readonly title?: string;
}) {
  const text = useUiText();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const signature = errors.map((item) => `${item.field}:${item.message}`).join('|');

  useEffect(() => {
    if (signature !== '') ref.current?.focus();
  }, [signature]);

  if (errors.length === 0) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby={titleId}
      className="ui-error-summary"
    >
      <p id={titleId} className="ui-error-summary-title">
        {title ?? text('ui.form.errorSummary')}
      </p>
      <ul>
        {errors.map((item) => (
          <li key={item.field}>
            <a
              href={`#${item.field}`}
              onClick={(event) => {
                const target = document.querySelector<HTMLElement>(
                  `[name="${CSS.escape(item.field)}"]`,
                );
                if (target) {
                  event.preventDefault();
                  target.focus();
                }
              }}
            >
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
