import React from 'react';

export default React.createClass({
  displayName: 'Table',

  propTypes: {
    headers: React.PropTypes.array,
    footers: React.PropTypes.array,
    rows: React.PropTypes.array.isRequired,
  },

  getDefaultProps() {
    return {
    };
  },

  // Render

  getTableHead(rows) {
    if (!rows) {
      return null;
    }

    return (
      <thead>
        {rows.map((row, rowIdx) => {
          return (
            <tr key={rowIdx}>
              {row.map((col, colIdx) => {
                const className = colIdx > 0 ? 'text-xs-right' : '';

                return (
                  <th key={colIdx} className={className}>{col}</th>
                );
              })}
            </tr>
          );
        })}
      </thead>
    );
  },

  getTableFoot(rows) {
    if (!rows) {
      return null;
    }

    return (
      <tfoot>
        {rows.map((row, rowIdx) => {
          return (
            <tr key={rowIdx}>
              {row.map((col, colIdx) => {
                const className = colIdx > 0 ? 'text-xs-right' : '';

                return (
                  <td key={colIdx} className={className}>{col}</td>
                );
              })}
            </tr>
          );
        })}
      </tfoot>
    );
  },

  getTableBody(rows) {
    return (
      <tbody>
        {rows.map(this.getTableRow)}
      </tbody>
    );
  },

  getTableRow(row, idx) {
    return (
      <tr key={idx}>
        {row.map(this.getTableCol)}
      </tr>
    );
  },

  getTableCol(col, idx) {
    const className = idx > 0 ? 'text-xs-right' : '';

    return (
      <td key={idx} className={className}>{col}</td>
    );
  },

  render() {
    return (
      <table className="table table--notebook">
        {this.getTableHead(this.props.headers)}
        {this.getTableBody(this.props.rows)}
        {this.getTableFoot(this.props.footers)}
      </table>
    );
  },
});
