import { ElementSelector } from '../constant';
import { EventType, ev } from '../eventmitter';

export const initCleanDynamicData = () => {
  const chartSelector = document.querySelector(
    `#${ElementSelector.cleanDynamicData}`,
  ) as HTMLInputElement;

  chartSelector?.addEventListener('change', () => {
    console.log('Clean dynamic data:', chartSelector.checked);

    ev.emit(EventType.cleanDynamicData, chartSelector.checked);
  });
};
