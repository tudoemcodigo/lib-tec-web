/**
 * Para onde o foco volta quando uma janela fecha (`Dialog` do Base UI). Quem abre a janela a partir de um item de menu
 * perde o item ao fechar o menu, e o foco cairia no `body`: `returnFocus` aponta o elemento certo (por exemplo, o botão que
 * abriu o menu). Sem ele, vale o padrão do Base UI (o elemento que tinha o foco ao abrir). Elemento ausente ou desligado do
 * documento também cai no padrão.
 */
export type ReturnFocus = () => HTMLElement | null;

export function focusAfterClose(
  returnFocus: ReturnFocus | undefined,
): (() => HTMLElement | true) | undefined {
  if (returnFocus === undefined) return undefined;
  return () => {
    const target = returnFocus();
    return target?.isConnected === true ? target : true;
  };
}
