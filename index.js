/// <reference path="node_modules/@types/echarts/index.d.ts" />
/// <reference path="node_modules/@types/jquery/index.d.ts" />

const initChart = () => {
  const dom = document.getElementById('chart-container');
  const chart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false,
  });

  chart.showLoading();

  window.addEventListener('resize', chart.resize);

  return chart;
};

const seriesType = {
  tree: (data) => ({
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

    expandAndCollapse: false,
    animationDuration: 550,
    animationDurationUpdate: 750,
    initialTreeDepth: 10,
  }),
  treeMap: (data) => {
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

    /**
     * @type {import('echarts').EChartOption.SeriesTreemap}
     */
    const options = {
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

    return options;
  },
};

/**
 *
 * @param {import('echarts').ECharts} chart
 */
const renderChart = (chart) => {
  /**
   * @type {import('echarts').EChartOption}
   */
  let option = null;

  $.get('/data/data-test.json', function (data) {
    chart.hideLoading();
    const formatUtil = echarts.format;

    chart.setOption(
      (option = {
        title: {
          text: 'Slow UI Element path & time',
          left: 'center',
          top: 24,
        },
        tooltip: {
          formatter: function (info) {
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
        // TODO: support change series type
        series: [seriesType['treeMap'](data)],
      }),
    );
  });

  if (option && typeof option === 'object') {
    chart.setOption(option);
  }
};

const chart = initChart();
renderChart(chart);
