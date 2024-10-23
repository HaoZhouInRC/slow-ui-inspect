import * as Echarts from 'echarts';
import type echarts from 'echarts';
import { isHoldMetaKey, updateFilterValue } from '../chart-tools';
import { EventType, ev } from '../eventmitter';
import { getTitle } from '../title';
import { filterIndex, Order, transformData } from './transform-data';
import { transformDownloadData } from './transform-download-data';
import { defaultValue, SeriesType } from '../constant';

const seriesType: Record<SeriesType, any> = {
  tree: (data: any): echarts.TreeSeriesOption => ({
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
  treeMap: (data: any): echarts.TreemapSeriesOption => {
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
      leafDepth: 8,
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
      width: '95%',
      height: '95%',
    };
  },
};

const unitTitle: Record<Order, string> = {
  'total-95': 'Total P95',
  'time-50': 'P50',
  'time-75': 'P75',
  'time-95': 'P95',
  count: 'Total Count',
};

const unitMap: Record<Order, string> = {
  'total-95': 'ms',
  'time-50': 'ms',
  'time-75': 'ms',
  'time-95': 'ms',
  count: '',
};

export const renderChart = (chart: Echarts.EChartsType, rawData: any) => {
  chart.hideLoading();

  const filterValue = { ...defaultValue };

  let data: any = null;
  let dataMap: Map<string, number[]> = new Map();

  function _renderChart(filterValue: {
    filterPrefix: string;
    chartType: string;
    orderBy: Order;
  }) {
    chart.clear();

    const formatUtil = Echarts.format;

    let body: [string, number][];

    [data, body] = transformData(
      rawData,
      filterValue.filterPrefix,
      filterValue.orderBy,
    );

    body.forEach(([key, ...rest]) => {
      dataMap.set(key, rest);
    });

    const option: echarts.EChartsOption = {
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
          const treePath: string[] = [];

          for (let i = 1; i < treePathInfo.length; i++) {
            treePath.push(treePathInfo[i].name);
          }

          const valueItem = () => {
            const rawData = dataMap.get(`root.${treePath.join('.')}`);

            if (filterValue.orderBy === 'count') {
              return `${unitTitle[filterValue.orderBy]}: ${formatUtil.addCommas(value)} ${unitMap[filterValue.orderBy]} ${rawData ? 'p95 ' + rawData[filterIndex['time-95']] + 'ms' : ''}`;
            }

            if (info.data.children.length === 0) {
              return `${unitTitle[filterValue.orderBy]}: ${formatUtil.addCommas(value)} ${unitMap[filterValue.orderBy]}`;
            }
          };

          return [
            '<div class="tooltip-title" style="max-width: 240px; white-space: break-spaces; word-wrap: break-word;">' +
              formatUtil.encodeHTML(treePath.join('.')) +
              '</div>',
            valueItem(),
          ].join('');
        },
      },
      series: [seriesType[filterValue.chartType as SeriesType](data)],
    };

    chart.setOption(option);
  }

  ev.on(EventType.chartTypeChange, (value: keyof typeof seriesType) => {
    filterValue.chartType = value;
    _renderChart(filterValue);
  });

  ev.on(EventType.filterPrefixChange, (value: string) => {
    filterValue.filterPrefix = value;
    _renderChart(filterValue);
  });

  ev.on(EventType.dataFilterChange, (value: Order) => {
    filterValue.orderBy = value;
    _renderChart(filterValue);
  });

  ev.on(EventType.downloadData, () => {
    const a = document.createElement('a');

    const blob = new Blob(
      [transformDownloadData(data, 0, filterValue.orderBy).join('\n')],
      {
        type: 'text/plain',
      },
    );
    a.href = URL.createObjectURL(blob);
    a.download = `slow-ui-data-${filterValue.orderBy}.txt`;

    a.click();
  });

  chart.on('click', (params) => {
    const path = (params.data as Record<string, any>)['path'];
    if (path) {
      if (isHoldMetaKey()) {
        chart.dispatchAction({ type: 'hideTip' });

        updateFilterValue(path);
        ev.emit(EventType.filterPrefixChange, path);
      }
    }
  });

  _renderChart(filterValue);
};
