import React from 'react';

import Chart from 'chart.js';

export default React.createClass({
  displayName: 'Chart',

  propTypes: {
    labels: React.PropTypes.array.isRequired,
    datasets: React.PropTypes.array.isRequired,
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    responsive: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      width: '100%',
      height: '400px',
      responsive: true,
    };
  },

  componentDidMount() {
    this._initializeChart();
  },

  // Render

  render() {
    const chartStyle = {
      width: this.props.width,
      height: this.props.height,
    };

    return (
      <canvas ref="chart" style={chartStyle}></canvas>
    );
  },

  // Private

  _initializeChart() {
    const chartEl = React.findDOMNode(this.refs.chart);
    const chartCtx = chartEl.getContext('2d');
    new Chart(chartCtx).Line({
      labels: this.props.labels,
      datasets: this.props.datasets,
    }, {
      responsive: this.props.responsive,
    });
  },
});
