---
titulo: Compatibilidade do @tudoemcodigo/tooling
tipo: referencia
dono: Tudo em Código (mantenedor do monorepo)
status: vigente
verificado-em: 2026-11-04
---

[🏠 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md) › [📚 Documentação](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) › ⚡ Compatibilidade

# ⚡ Compatibilidade do `@tudoemcodigo/tooling`

> Para quem vai atualizar versões. Marca o que foi verificado e o que não foi.

## 📑 Sumário

- [🧰 Versões](#-versões)
- [🖥️ Sistemas](#️-sistemas)
- [🔗 Por que ESLint 9](#-por-que-eslint-9)

## 🧰 Versões

| Item       | Faixa                             | Verificado com |
| ---------- | --------------------------------- | -------------- |
| Node       | `^24` (`engine-strict`)           | 24.20          |
| npm        | 11                                | 11.19          |
| TypeScript | `>=5.9 <6` (peer)                 | 5.9            |
| ESLint     | `^9.39` (peer)                    | 9.39           |
| Prettier   | `^3` (peer)                       | 3.9            |
| Vitest     | `^5` (usado pelo consumidor)      | 5.1            |
| React      | 19 (tipos e regras de hooks/a11y) | 19.3           |

## 🖥️ Sistemas

- **Windows**: verificado (`npm run verify` completo).
- **Linux (Ubuntu)**: verificado no CI (`verify` e E2E nos três navegadores).
- **macOS**: **não verificado**.

## 🔗 Por que ESLint 9

O `eslint-plugin-jsx-a11y` ainda não declara suporte ao ESLint 10 (FRT-BAS-03). O `tooling` e o `typescript-eslint` sobem juntos quando todos os plugins declararem suporte; salto de major do TypeScript segue FRT-BAS-04.

> [!NOTE]
> O ESLint 9.39.5 é marcado como "não suportado" pelo npm. Isso é consequência da restrição acima e fica registrado como dívida, não escondido.

---

⬅️ [Segurança](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/seguranca.md) · [Índice](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md)
