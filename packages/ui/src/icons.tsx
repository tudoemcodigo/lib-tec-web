import type { SVGProps } from 'react';

/** Ícones decorativos (`aria-hidden`): o texto ao lado é quem informa. Traço de 1,75 px, `currentColor`. */
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="1.25em"
      height="1.25em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

export const IconSuccess = () => (
  <Icon>
    <circle cx="10" cy="10" r="7.5" />
    <path d="m6.75 10.25 2.25 2.25 4.25-4.75" />
  </Icon>
);

export const IconInfo = () => (
  <Icon>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 9v4.5M10 6.5v.01" />
  </Icon>
);

export const IconWarning = () => (
  <Icon>
    <path d="M10 3 18 16.5H2L10 3Z" />
    <path d="M10 8.5v3.5M10 14.25v.01" />
  </Icon>
);

export const IconError = () => (
  <Icon>
    <circle cx="10" cy="10" r="7.5" />
    <path d="m7.5 7.5 5 5m0-5-5 5" />
  </Icon>
);

export const IconClose = () => (
  <Icon>
    <path d="m5.5 5.5 9 9m0-9-9 9" />
  </Icon>
);

export const IconChevron = () => (
  <Icon>
    <path d="m8 5.5 4.5 4.5L8 14.5" />
  </Icon>
);

export const IconBack = () => (
  <Icon>
    <path d="M12 5.5 7.5 10l4.5 4.5" />
  </Icon>
);

export const IconInbox = () => (
  <Icon>
    <path d="M3 11.5 5 4.5h10l2 7M3 11.5v4h14v-4M3 11.5h4.25l.75 1.75h4l.75-1.75H17" />
  </Icon>
);

export const IconLock = () => (
  <Icon>
    <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" />
    <path d="M7 9V6.75a3 3 0 0 1 6 0V9" />
  </Icon>
);

export const IconCompass = () => (
  <Icon>
    <circle cx="10" cy="10" r="7.5" />
    <path d="m12.5 7.5-1.25 3.75L7.5 12.5l1.25-3.75L12.5 7.5Z" />
  </Icon>
);

export const IconEye = () => (
  <Icon>
    <path d="M1.75 10S4.75 4.5 10 4.5 18.25 10 18.25 10 15.25 15.5 10 15.5 1.75 10 1.75 10Z" />
    <circle cx="10" cy="10" r="2.25" />
  </Icon>
);

export const IconPencil = () => (
  <Icon>
    <path d="m12.5 4.5 3 3L7 16H4v-3l8.5-8.5Z" />
    <path d="m11 6 3 3" />
  </Icon>
);

export const IconTrash = () => (
  <Icon>
    <path d="M4 6h12M8 6V4h4v2M5.5 6l.75 10h7.5L14.5 6M8.5 9v4.5M11.5 9v4.5" />
  </Icon>
);

/** Inativar: círculo com pausa. */
export const IconPause = () => (
  <Icon>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M8.25 7.5v5M11.75 7.5v5" />
  </Icon>
);

/** Ativar: círculo com seta de retomar. */
export const IconPlay = () => (
  <Icon>
    <circle cx="10" cy="10" r="7.5" />
    <path d="m8.5 7 4.5 3-4.5 3V7Z" />
  </Icon>
);

export const IconUser = () => (
  <Icon>
    <circle cx="10" cy="7" r="3" />
    <path d="M3.75 16.5c.75-3 3.25-4.5 6.25-4.5s5.5 1.5 6.25 4.5" />
  </Icon>
);

export const IconSearch = () => (
  <Icon>
    <circle cx="9" cy="9" r="5.25" />
    <path d="m13 13 3.5 3.5" />
  </Icon>
);

export const IconFilter = () => (
  <Icon>
    <path d="M3 5h14l-5.25 6.25V16l-3.5-1.75v-3L3 5Z" />
  </Icon>
);
