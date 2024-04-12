import { ElementSelector } from '../constant';
import { EventType, ev } from '../eventmitter';

export const initChartSelector = () => {
  const chartSelector = document.querySelector(
    `#${ElementSelector.chartType}`,
  ) as HTMLSelectElement;

  chartSelector?.addEventListener('change', () => {
    console.log('Selected chart type:', chartSelector.value);

    ev.emit(EventType.chartTypeChange, chartSelector.value);
  });
};
