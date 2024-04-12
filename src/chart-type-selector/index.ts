import { ev } from '../eventmitter';

const initChartSelector = () => {
  const chartSelector = document.querySelector(
    '#chart-type-selector',
  ) as HTMLSelectElement;

  chartSelector?.addEventListener('change', () => {
    console.log('Selected chart type:', chartSelector.value);

    ev.emit('chart-type-change', chartSelector.value);
  });
};

initChartSelector();
