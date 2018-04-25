import React, { Component } from 'react';

const Table = (props) => (
  <div className="history--table">
    <div className="row header">
      <div className="cell">
        <h4>Date</h4>
      </div>
      <div className="cell right">
        <h4>{props.heading}</h4>
      </div>
    </div>
    <div className="table-body">
      {(props.rows.length === 0)
        ? <p style={{fontSize:"1.2rem", borderBottom:"1px solid #999", margin:0, padding:"5px 0", textAlign:"center"}}>No records found</p>
        : props.rows.map(row => (
            <div className="row" key={row._id}>
              <div className="cell">{row._id}</div>
              <div className="cell right">{`${row[Object.keys(row)[1]]} ${props.unit}`}</div>
            </div>
          ))
    }
    </div>
  </div>
);

class HistoryTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'sunjoules'
    }
  }

  selectTab = (tab) => {
    this.setState({ tab });
  }

  TabHeading = (props) => (
    <div
      key={props.name.toLowerCase()}
      className={`cell--clickable ${props.tab===props.name.toLowerCase() ? "cell--active" : ''}`}
      onClick={() => this.selectTab(props.name.toLowerCase())}
    >
      <h2>{props.name}</h2>
    </div>
  );

  render() {
    if (!this.props.history) return '';

    return (
      <div className="history">
        <div className="history--header">
          <this.TabHeading name="SunJoules" tab={this.state.tab} />
          <this.TabHeading name="MORE" tab={this.state.tab} />
        </div>
        { this.state.tab === "sunjoules" && this.props.history.sj_transactions &&
          <Table heading="Solar Used" unit="SunJoules" rows={this.props.history.sj_transactions} />
        }
        { this.state.tab === "more" && this.props.history.mt_transactions &&
          <Table heading="Tokens Earned" unit="MORE" rows={this.props.history.mt_transactions} />
        }
      </div>
    );
  }
}

export default HistoryTable;
