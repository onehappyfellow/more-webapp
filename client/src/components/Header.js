import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clipboard from '../images/clipboard.svg';

class Header extends Component {
  render(){
    return (
      <div className="actions">
        <div className="action-left">
          <h2><span>{this.props.sj_used}</span> SunJoules used</h2>
          <h2><span>{this.props.mt_account}</span> MORE Tokens</h2>
        </div>
        <div className="action-right">
          <img
            src={clipboard}
            className="clickable"
            alt="clipboard and calculator icon"
            onClick={() => this.props.openModal('settings')}
            aria-label="open your history and settings"
          />
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  sj_used: PropTypes.number.isRequired,
  mt_account: PropTypes.number.isRequired,
  openModal: PropTypes.func.isRequired
};

export default Header;
