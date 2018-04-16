var graph = Highcharts.chart('av-ev-graph', {
  credits: false,
  chart: {
    backgroundColor: null,
    style: {
        fontFamily: "system, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Lucida Grande', sans-serif",
    }
  },
  title: {
    text: null
  },
  xAxis: {
    visible: false,
    gridLineColor: '#e5e5e5'
  },
  yAxis: [{
      lineWidth: 1,
      title: {
        text: null
      },
      min: -1,
      max: 1,
      alignTicks: false,
      gridLineColor: '#e5e5e5'
    }, {
      lineWidth: 1,
      opposite: true,
      title: {
        text: null
      },
      min: -5,
      max: 5,
      alignTicks: false,
      gridLineColor: '#e5e5e5'
    }
  ],
  plotOptions: {
    series: {
      marker: {
        enabled: false
      }
    }
  },
  series: [{
      name: 'EV',
      type: 'column',
      color: 'rgba(51, 156, 158, 0.5)',
      legendIndex: 1,
      data: [],
      yAxis: 1
    }, {
      name: 'AV',
      color: 'rgba(16, 24, 34, 0.9)',
      legendIndex: 0,
      data: []
  }]
});
