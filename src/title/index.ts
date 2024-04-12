import { EventType, ev } from '../eventmitter';

const defaultTitle = document.title;

let title = defaultTitle;

ev.on(EventType.selectFiles, (fileName) => {
  title = `${defaultTitle} - ${fileName}`;

  document.title = title;
});

export const getTitle = () => {
  return title;
};
