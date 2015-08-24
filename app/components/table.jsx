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
      <thead>
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
    return (
      <td key={idx}>{col}</td>
    );
  },

  render() {
    return (
      <table className="table">
        {this.getTableHead(this.props.headers)}
        {this.getTableBody(this.props.rows)}
      </table>
    );
  },

  // Private

});
