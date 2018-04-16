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
  tooltip: {
    crosshairs: {
      color: '#e5e5e5',
      dashStyle: 'solid'
    },
    backgroundColor: 'white',
    borderRadius: 0,
    borderWidth: 0,
    shared: true,
    formatter: function() {
      return `<div>
                <b>Post: </b>${this.x}<br />
                <b>Alignment: </b>${this.points[0].point.alignment}<br />
                <b>Post Topic: </b>${this.points[0].point.topic}<br />
                <b>Engagement Value (EV): </b>${this.points[0].y}<br />
                <b>Alignment Value (AV): </b>${this.points[1].y}<br />
              </div>`;
    }
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
  legend: {
    verticalAlign: 'top',
    reversed: true,
    symbolRadius: 0,
    margin: 18
  },
  series: [{
      name: 'Engagement Value (EV)',
      type: 'column',
      color: 'rgba(51, 156, 158, 0.5)',
      data: [],
      yAxis: 1
    }, {
      name: 'Alignment Value (AV)',
      type: 'spline',
      color: 'rgba(16, 24, 34, 0.9)',
      data: []
  }]
});
