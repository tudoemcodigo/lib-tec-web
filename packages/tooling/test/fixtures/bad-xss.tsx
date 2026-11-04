// Fixture hostil: sinks de XSS, eval, storage, texto solto e formatação sem locale.
export function Bad({ html }: { readonly html: string }) {
  document.body.innerHTML = html;
  document.write(html);
  document.body.insertAdjacentHTML('beforeend', html);
  eval(html);
  new Function(html);
  localStorage.setItem('token', html);
  const text = new Date().toLocaleDateString();
  return (
    <section aria-label="Painel fixo">
      texto solto
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {text}
    </section>
  );
}
