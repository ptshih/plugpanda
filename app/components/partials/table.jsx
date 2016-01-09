import React from 'react';

export default React.createClass({
  displayName: 'Table',

  propTypes: {
    headers: React.PropTypes.array,
    rows: React.PropTypes.array.isRequired,
  },

  getDefaultProps() {
    return {
    };
  },

  // Render

  getTableHead(headers) {
    if (!headers) {
      return null;
    }

    return (
      <thead className="thead-default">
        {headers.map((header, idx) => {
          return (
            <th key={idx}>{header}</th>
          );
        })}
      </thead>
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
    const className = idx > 0 ? 'text-right' : '';

    return (
      <td key={idx} className={className}>{col}</td>
    );
  },

  render() {
    return (
      <table className="table table-sm">
        {this.getTableHead(this.props.headers)}
        {this.getTableBody(this.props.rows)}
      </table>
    );
  },
});
