import {
  faAnglesLeft,
  faAnglesRight,
  faArrowLeft,
  faArrowUp,
  faBars,
  faChevronDown,
  faChevronRight,
  faCircleCheck,
  faCircleHalfStroke,
  faCircleInfo,
  faCirclePause,
  faCirclePlay,
  faCircleQuestion,
  faCircleXmark,
  faCompass,
  faEllipsisVertical,
  faEye,
  faFilter,
  faHouse,
  faInbox,
  faLock,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
  faReceipt,
  faRightFromBracket,
  faTrashCan,
  faTriangleExclamation,
  faUser,
  faUsers,
  faXmark,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Ícones do Font Awesome Free (CC BY 4.0; código MIT). Só os dados do desenho viram `<svg>` aqui: sem `fontawesome-svg-core`, sem
 * CSS injetado em tempo de execução (a CSP estrita não permite) e só os ícones importados entram no pacote. São decorativos
 * (`aria-hidden`): o texto ao lado, ou o `aria-label` do botão, é quem informa.
 */
export function FaIcon({ icon }: { readonly icon: IconDefinition }) {
  const [width, height, , , path] = icon.icon;
  return (
    <svg
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {(Array.isArray(path) ? path : [path]).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const make = (icon: IconDefinition) => {
  const Component = () => <FaIcon icon={icon} />;
  return Component;
};

export const IconSuccess = make(faCircleCheck);
export const IconInfo = make(faCircleInfo);
export const IconWarning = make(faTriangleExclamation);
export const IconError = make(faCircleXmark);
export const IconClose = make(faXmark);
export const IconChevron = make(faChevronRight);
export const IconChevronDown = make(faChevronDown);
export const IconBack = make(faArrowLeft);
export const IconInbox = make(faInbox);
export const IconLock = make(faLock);
export const IconCompass = make(faCompass);
export const IconEye = make(faEye);
export const IconPencil = make(faPenToSquare);
export const IconTrash = make(faTrashCan);
/** Inativar: círculo com pausa. */
export const IconPause = make(faCirclePause);
/** Ativar: círculo com seta de retomar. */
export const IconPlay = make(faCirclePlay);
export const IconUser = make(faUser);
export const IconSearch = make(faMagnifyingGlass);
export const IconFilter = make(faFilter);
/** Menu de ações: três pontos na vertical. */
export const IconMore = make(faEllipsisVertical);
export const IconPlus = make(faPlus);
export const IconHome = make(faHouse);
export const IconUsers = make(faUsers);
export const IconReceipt = make(faReceipt);
export const IconSignOut = make(faRightFromBracket);
export const IconMenu = make(faBars);
export const IconContrast = make(faCircleHalfStroke);
export const IconHelp = make(faCircleQuestion);
export const IconCollapse = make(faAnglesLeft);
export const IconExpand = make(faAnglesRight);
export const IconTop = make(faArrowUp);
