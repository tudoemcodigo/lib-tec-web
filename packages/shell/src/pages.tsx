import { Button, DataList, ScrollRegion, Section } from '@tudoemcodigo/ui';
import { useShell } from './context.js';
import { SHORTCUTS_ANCHOR } from './ids.js';
import { useShellText } from './messages.js';
import { PageTitle } from './PageTitle.js';
import { initials, isShortcutLetter } from './permissions.js';

/** Trilha das páginas da casca: só o Início, o pai imediato. */
function useHomeTrail() {
  const text = useShellText();
  const { routes } = useShell();
  return [{ label: text('shell.nav.home'), href: routes.home }];
}

/**
 * Perfil de quem está logado: nome, como entrou, o que pode fazer (permissões em linguagem de quem usa, pelos textos de
 * `permissionLabels`) e a saída. Vai numa rota do sistema (por padrão `/perfil`), dentro do `AppShell`.
 */
export function ProfilePage() {
  const text = useShellText();
  const { user, onSignOut, permissionLabels } = useShell();
  const trail = useHomeTrail();
  const permissions = [...user.permissions].sort();
  return (
    <section aria-labelledby="shell-profile-title">
      <PageTitle
        titleId="shell-profile-title"
        title={text('shell.profile.title')}
        breadcrumb={trail}
        description={text('shell.profile.description')}
      />

      <Section title={text('shell.profile.account')}>
        <div className="shell-profile-account">
          <span
            className="shell-avatar shell-avatar-large"
            data-initials={initials(user.name)}
            aria-hidden="true"
          />
          <DataList
            items={[
              { label: text('shell.profile.name'), value: user.name },
              { label: text('shell.profile.access'), value: text('shell.profile.access.value') },
            ]}
          />
        </div>
      </Section>

      <Section title={text('shell.profile.permissions')}>
        {permissions.length === 0 ? (
          <p className="ui-help">{text('shell.profile.permissions.empty')}</p>
        ) : (
          <ul className="shell-permission-list">
            {permissions.map((code) => {
              // hasOwn: um código como "__proto__" ou "constructor" nunca pode puxar texto do protótipo
              const label = Object.hasOwn(permissionLabels, code)
                ? permissionLabels[code]
                : undefined;
              return <li key={code}>{label ?? <code>{code}</code>}</li>;
            })}
          </ul>
        )}
      </Section>

      <Section
        title={text('shell.profile.session')}
        description={text('shell.profile.session.text')}
      >
        <Button variant="secondary" onClick={onSignOut}>
          {text('shell.user.signOut')}
        </Button>
      </Section>
    </section>
  );
}

/**
 * Ajuda: como navegar, atalhos de teclado (montados a partir do menu e da configuração do sistema) e o que fazer com o
 * código de suporte. O sistema ajusta qualquer texto pelas chaves `shell.help.*` de `messages`.
 */
export function HelpPage() {
  const text = useShellText();
  const { nav, routes, hasSearch, shortcuts } = useShell();
  const trail = useHomeTrail();
  const rows: { readonly keys: string; readonly action: string }[] = [];
  if (shortcuts) {
    if (hasSearch) rows.push({ keys: '/', action: text('shell.help.shortcuts.search') });
    if (routes.help !== null) rows.push({ keys: '?', action: text('shell.help.shortcuts.help') });
    for (const item of nav) {
      if (!isShortcutLetter(item.shortcut)) continue;
      rows.push({
        keys: `g  ${item.shortcut}`,
        action:
          item.shortcutDescription ??
          text('shell.help.shortcuts.goto', { destination: item.label }),
      });
    }
  }
  rows.push(
    { keys: 'Ctrl  K', action: text('shell.help.shortcuts.palette') },
    { keys: 'Esc', action: text('shell.help.shortcuts.esc') },
  );
  return (
    <>
      <PageTitle title={text('shell.help.title')} breadcrumb={trail} />

      <section aria-labelledby="shell-help-navigate" className="ui-prose">
        <h2 id="shell-help-navigate">{text('shell.help.navigate.title')}</h2>
        <ul>
          <li>{text('shell.help.navigate.menu')}</li>
          <li>{text('shell.help.navigate.breadcrumb')}</li>
          {hasSearch ? <li>{text('shell.help.navigate.search')}</li> : null}
          <li>{text('shell.help.navigate.account')}</li>
        </ul>
      </section>

      <section aria-labelledby={SHORTCUTS_ANCHOR} className="ui-prose">
        <h2 id={SHORTCUTS_ANCHOR}>{text('shell.help.shortcuts.title')}</h2>
        <p>{text('shell.help.shortcuts.text')}</p>
        <ScrollRegion label={text('shell.help.shortcuts.title')}>
          <table>
            <caption className="ui-sr">{text('shell.help.shortcuts.title')}</caption>
            <thead>
              <tr>
                <th scope="col">{text('shell.help.shortcuts.key')}</th>
                <th scope="col">{text('shell.help.shortcuts.action')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ keys, action }) => (
                <tr key={keys}>
                  <th scope="row">
                    <kbd className="shell-kbd">{keys}</kbd>
                  </th>
                  <td>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </section>

      <section aria-labelledby="shell-help-support" className="ui-prose">
        <h2 id="shell-help-support">{text('shell.help.support.title')}</h2>
        <p>{text('shell.help.support.text')}</p>
      </section>
    </>
  );
}

/** Declaração de acessibilidade: recursos, o que foi e o que não foi verificado e como relatar uma barreira. */
export function AccessibilityPage() {
  const text = useShellText();
  const trail = useHomeTrail();
  return (
    <>
      <PageTitle title={text('shell.accessibility.title')} breadcrumb={trail} />
      <p className="ui-prose">{text('shell.accessibility.intro')}</p>

      <section aria-labelledby="shell-a11y-features" className="ui-prose">
        <h2 id="shell-a11y-features">{text('shell.accessibility.features.title')}</h2>
        <ul>
          <li>{text('shell.accessibility.features.theme')}</li>
          <li>{text('shell.accessibility.features.text')}</li>
          <li>{text('shell.accessibility.features.contrast')}</li>
          <li>{text('shell.accessibility.features.motion')}</li>
          <li>{text('shell.accessibility.features.keyboard')}</li>
        </ul>
      </section>

      <section aria-labelledby="shell-a11y-verified" className="ui-prose">
        <h2 id="shell-a11y-verified">{text('shell.accessibility.verified.title')}</h2>
        <p>{text('shell.accessibility.verified.text')}</p>
      </section>

      <section aria-labelledby="shell-a11y-limits" className="ui-prose">
        <h2 id="shell-a11y-limits">{text('shell.accessibility.limits.title')}</h2>
        <p>{text('shell.accessibility.limits.text')}</p>
      </section>

      <section aria-labelledby="shell-a11y-report" className="ui-prose">
        <h2 id="shell-a11y-report">{text('shell.accessibility.report.title')}</h2>
        <p>{text('shell.accessibility.report.text')}</p>
      </section>
    </>
  );
}
