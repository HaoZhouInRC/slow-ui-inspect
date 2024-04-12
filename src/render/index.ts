import { EventType, ev } from '../eventmitter';
import { initChart } from './init-chart';
import { renderChart } from './render-chart';
import { transformData } from './transform-data';

ev.on(EventType.upload, (data) => {
  // hide upload element
  document.getElementById('upload')!.style.display = 'none';

  // init chart
  const chart = initChart();

  // transform data
  const chartData = transformData(data);

  // render chart
  renderChart(chart, chartData);
});
