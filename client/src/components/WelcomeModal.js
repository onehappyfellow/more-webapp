import React, { Component } from 'react';
import PropTypes from 'prop-types';

class WelcomeModal extends Component{
  render(){
    return (
      <div className="modal">
        <div className="modal--inner">
          <button onClick={this.props.closeModal} className="close" aria-label="close">&times;</button>
          <h2 style={{textAlign:"center"}}>Welcome! How does this app work?</h2>
          <div className="welcome-content">
            <div className="welcome-col">
              <h1>1</h1>
              <h2>Use SunJoules</h2>
              <p>SunJoule<sup>TM</sup> solar microcredits are like tiny energy offsets. They represent increments of solar energy available on the electric grid.</p>
            </div>
            <div className="welcome-col">
              <h1>2</h1>
              <h2>Don't run out</h2>
              <p>Each day the app uses enough SunJoules to offset a typical cell phone's energy use. If you want to use more, you can change to 120% or even 200% solar, but don't run out.</p>
              <p>If the green level drops to zero, you loose your streak and aren't using solar anymore.</p>
            </div>
            <div className="welcome-col">
              <h1>3</h1>
              <h2>Earn More each week</h2>
              <p>Every Sunday you earn More<sup>TM</sup> reward tokens based on how many SunJoules you used that week. It's simple: <strong>Use Solar, Get More</strong>.</p>
              <p>Have fun, and thanks for supporting solar energy.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

WelcomeModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default WelcomeModal;
