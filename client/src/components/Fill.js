import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Fill extends Component{
  render(){
    const max = 200;
    const height = `${Math.round((max - this.props.sj_account) / max * 100)}%`;
    // 100% if sj_account == 0, 0% if sj_account == max
    const backgroundColor = (this.props.sj_account > 0) ? "#0dbdff" : "#353535";

    return (
      <div className="fill" style={{backgroundColor, height}}></div>
    );
  }
}

Fill.propTypes = {
  sj_account: PropTypes.number.isRequired
};

export default Fill;
