import React from 'react';

import Chart from 'chart.js';

export default React.createClass({
  displayName: 'Chart',

  propTypes: {
    labels: React.PropTypes.array.isRequired,
    datasets: React.PropTypes.array.isRequired,
  },

  componentDidMount() {
    this._initializeChart();
  },

  // Render

  render() {
    const chartStyle = {
      width: '100%',
      height: '400px',
    };

    return (
      <canvas id="timeline" ref="chart" style={chartStyle}></canvas>
    );
  },


  _initializeChart() {
    const chartEl = React.findDOMNode(this.refs.chart);
    const chartCtx = chartEl.getContext('2d');
    const chart = new Chart(chartCtx).Line({
      labels: this.props.labels,
      datasets: this.props.datasets,
    }, {
      responsive: true,
    });
  },
});
