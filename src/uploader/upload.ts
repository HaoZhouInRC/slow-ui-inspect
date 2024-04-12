import { ElementSelector } from '../constant';
import { EventType, ev } from '../eventmitter';

export const initUpload = () => {
  const element: HTMLInputElement = document.getElementById(
    ElementSelector.uploadInput,
  ) as HTMLInputElement;

  element.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      ev.emit(EventType.selectFiles, file.name);

      // read the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;

        ev.emit(EventType.upload, data);
      };

      reader.readAsText(file);
    }
  });
};
