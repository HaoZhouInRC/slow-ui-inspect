import * as Echarts from 'echarts';
import type echarts from 'echarts';
import { isHoldMetaKey, updateFilterValue } from '../chart-tools';
import { EventType, ev } from '../eventmitter';
import { getTitle } from '../title';
import { filterIndex, Order, transformData, TreeItem } from './transform-data';
import { transformDownloadData } from './transform-download-data';
import { defaultValue, SeriesType } from '../constant';

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
    let root: TreeItem;

    [data, body, root] = transformData(
      rawData,
      filterValue.filterPrefix,
      filterValue.orderBy,
    );

    body.forEach(([key, ...rest]) => {
      dataMap.set(key, rest);
    });

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
            ...['#555', '#777', '#999', '#bbb', '#ddd', '#fff'].map(
              (color) => ({
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
              }),
            ),
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
            formatter: (params) => {
              const percentage =
                Math.floor(
                  (parseInt(params.value as string, 10) / root.value) * 100,
                ) + '%';

              if ((params.data as TreeItem).children.length === 0) {
                return [
                  '{name|' + params.name + '}',
                  '{hr|}',
                  `{name|p95: ${(params.data as TreeItem).rawData[filterIndex['time-95'] + 1]}ms}`,
                  '{hr|}',
                  `{name|Count: ${params.value!} ${percentage}}`,
                ].join('\n');
              }

              return `${params.name} ${params.value} ${percentage}`;
            },
            rich: {
              name: {
                fontSize: 12,
                color: '#fff',
              },
              hr: {
                width: '100%',
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 0.5,
                height: 0,
                lineHeight: 10,
              },
            },
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

    const option: echarts.EChartsOption = {
      title: {
        text: `Slow UI From "${getTitle()}"`,
        left: 'center',
        top: 24,
      },
      tooltip: {
        trigger: 'item',
        formatter: function (info: any) {
          const data = info.data as TreeItem;

          return [
            '<div class="tooltip-title" style="max-width: 240px; white-space: break-spaces; word-wrap: break-word;">' +
              formatUtil.encodeHTML(data.path) +
              '</div>',
          ].join('');
        },
      },
      series: [seriesType[filterValue.chartType as SeriesType](data)],
    };

    chart.setOption(option);
  }

  ev.on(EventType.chartTypeChange, (value: SeriesType) => {
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
