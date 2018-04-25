import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HistoryTable from './HistoryTable';
import webApp from '../images/webapp-icon.svg';

class SettingsModal extends Component{
  render(){
    return (
      <div className="modal">
        <div className="modal--inner">
          <button onClick={this.props.closeModal} className="close" aria-label="close">&times;</button>
          <HistoryTable history={this.props.user.history} />
          <div className="settings">
            <div className="settings--platform">
              <img src={webApp} className="web-app" alt="monitor in front of a globe"/>
              <h3>Currently using solar via the MORE webapp</h3>
              <a href="/logout" className="small" onClick={this.props.logout}>Logout</a>
            </div>
            <div className="settings--multiplier">
              <h2>{`${Math.round(this.props.user.multiplier * 100)}% SOLAR`}</h2>
              <div className="controls">
                <button className="up" onClick={() => this.props.incrementMultiplier(0.1)}>&#x25B2;</button>
                <button className="down" onClick={() => this.props.incrementMultiplier(-0.1)}>&#x25BC;</button>
              </div>
              <p className="small">
                { this.props.alert ? this.props.alert : `${Math.round(50 * this.props.user.multiplier)} SunJoules per day estimated usage` }
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  componentDidMount(){
    this.props.getTransactions();
  }
}

SettingsModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  incrementMultiplier: PropTypes.func.isRequired,
  getTransactions: PropTypes.func.isRequired,
  alert: PropTypes.string,
  user: PropTypes.shape({
    multiplier: PropTypes.number.isRequired
  })
};

export default SettingsModal;
