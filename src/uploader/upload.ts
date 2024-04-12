import { ev } from '../eventmitter';

export const initUpload = () => {
  const element: HTMLInputElement = document.getElementById(
    'upload-input',
  ) as HTMLInputElement;

  element.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      // read the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;

        ev.emit('upload', data);
      };

      reader.readAsText(file);
    }
  });
};
