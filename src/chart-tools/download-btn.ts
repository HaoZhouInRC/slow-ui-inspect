import { ElementSelector } from '../constant';
import { EventType, ev } from '../eventmitter';

export const initDownloadButton = () => {
  const btn = document.querySelector(
    `#${ElementSelector.downloadBtn}`,
  ) as HTMLButtonElement;

  btn?.addEventListener('click', () => {
    ev.emit(EventType.downloadData);
  });
};
