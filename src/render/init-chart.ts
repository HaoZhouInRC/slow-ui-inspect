import * as echarts from 'echarts';

export const initChart = () => {
  const dom = document.getElementById('chart-container');
  const chart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false,
  });

  chart.showLoading();

  window.addEventListener('resize', () => {
    chart.resize();
  });

  return chart;
};
