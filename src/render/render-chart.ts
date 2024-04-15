import * as Echarts from 'echarts';
import { EventType, ev } from '../eventmitter';
import { getTitle } from '../title';
import { Order, transformData } from './transform-data';
import { transformDownloadData } from './transform-download-data';
import { defaultValue } from '../constant';

const seriesType = {
  tree: (data: any) => ({
    type: 'tree',
    data: [data],
    top: '1%',
    left: '7%',
    bottom: '1%',
    right: '20%',
    symbolSize: 7,
    label: {
      position: 'left',
      verticalAlign: 'middle',
      align: 'right',
      fontSize: 9,
    },
    leaves: {
      label: {
        position: 'right',
        verticalAlign: 'middle',
        align: 'left',
      },
    },
    emphasis: {
      focus: 'descendant',
    },
    expandAndCollapse: true,
    animationDuration: 550,
    animationDurationUpdate: 750,
    initialTreeDepth: 10,
  }),
  treeMap: (data: any) => {
    function getLevelOption() {
      return [
        {
          // root level
          itemStyle: {
            borderColor: '#333',
            borderWidth: 0,
            gapWidth: 1,
          },
          upperLabel: {
            show: false,
          },
        },
        ...['#555', '#777', '#999', '#bbb', '#ddd', '#fff'].map((color) => ({
          itemStyle: {
            borderColor: color,
            borderWidth: 3,
            gapWidth: 1,
          },
          emphasis: {
            itemStyle: {
              borderColor: '#ddd',
            },
          },
        })),
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            borderWidth: 5,
            gapWidth: 1,
            borderColorSaturation: 0.6,
          },
        },
      ];
    }

    return {
      name: 'Slow UI Element Count',
      type: 'treemap',
      visibleMin: 300,
      label: {
        show: true,
        formatter: '{b}',
      },
      upperLabel: {
        show: true,
        height: 30,
      },
      itemStyle: {
        borderColor: '#fff',
      },
      levels: getLevelOption(),
      data: data.children,
    };
  },
};

export const renderChart = (chart: Echarts.EChartsType, rawData: any) => {
  chart.hideLoading();

  let { chartType, cleanDynamicData, orderBy } = defaultValue;

  let data: any = null;

  function _renderChart() {
    chart.clear();

    const formatUtil = Echarts.format;

    data = transformData(rawData, cleanDynamicData, orderBy);

    const option: Echarts.EChartOption = {
      title: {
        text: `Slow UI From "${getTitle()}"`,
        left: 'center',
        top: 24,
      },
      tooltip: {
        trigger: 'item',
        formatter: function (info: any) {
          const value = info.value;
          const treePathInfo = info.treePathInfo;
          const treePath = [];
          for (let i = 1; i < treePathInfo.length; i++) {
            treePath.push(treePathInfo[i].name);
          }
          return [
            '<div class="tooltip-title" style="max-width: 240px; white-space: break-spaces; word-wrap: break-word;">' +
              formatUtil.encodeHTML(treePath.join('.')) +
              '</div>',
            'Avg time: ' + formatUtil.addCommas(value) + ' ms',
          ].join('');
        },
      },
      series: [seriesType[chartType as keyof typeof seriesType](data)],
    };

    chart.setOption(option);
  }

  ev.on(EventType.chartTypeChange, (value: keyof typeof seriesType) => {
    chartType = value;
    _renderChart();
  });

  ev.on(EventType.cleanDynamicData, (value: boolean) => {
    cleanDynamicData = value;
    _renderChart();
  });

  ev.on(EventType.dataFilterChange, (value: Order) => {
    orderBy = value;
    _renderChart();
  });

  ev.on(EventType.downloadData, () => {
    const a = document.createElement('a');

    const blob = new Blob([transformDownloadData(data).join('\n')], {
      type: 'text/plain',
    });
    a.href = URL.createObjectURL(blob);
    a.download = `slow-ui-data-${orderBy}.txt`;

    a.click();
  });

  _renderChart();
};
