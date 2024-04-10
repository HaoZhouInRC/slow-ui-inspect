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
          itemStyle: {
            borderColor: '#777',
            borderWidth: 0,
            gapWidth: 1,
          },
          upperLabel: {
            show: false,
          },
        },
        {
          itemStyle: {
            borderColor: '#555',
            borderWidth: 5,
            gapWidth: 1,
          },
          emphasis: {
            itemStyle: {
              borderColor: '#ddd',
            },
          },
        },
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
              '<div class="tooltip-title">' +
                formatUtil.encodeHTML(treePath.join('.')) +
                '</div>',
              'Count: ' + formatUtil.addCommas(value) + ' ',
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
