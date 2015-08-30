import React from 'react';

import Chart from 'chart.js';

export default React.createClass({
  displayName: 'Chart',

  propTypes: {
    labels: React.PropTypes.array.isRequired,
    datasets: React.PropTypes.array.isRequired,
    responsive: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      responsive: true,
    };
  },

  componentDidMount() {
    this._initializeChart();
  },

  componentDidUpdate() {
    this._initializeChart();
  },

  // Render

  render() {
    return (
      <canvas ref="chart" className="Chart"></canvas>
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
      showTooltips: false,
      scaleIntegersOnly: false,
      pointHitDetectionRadius: 0,
    });
  },
});
