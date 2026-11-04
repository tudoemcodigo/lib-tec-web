// Fixture conforme: texto vem de uma função de catálogo, sem sinks nem HTTP.
declare function t(key: string): string;

export function Good({ name }: { readonly name: string }) {
  return (
    <section aria-label={t('panel.label')}>
      <p>{t('panel.greeting')}</p>
      <p>{name}</p>
    </section>
  );
}
