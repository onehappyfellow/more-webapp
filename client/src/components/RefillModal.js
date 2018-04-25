import React, { Component } from 'react';
import ReactPlayer from 'react-player';

class RefillModal extends Component{
  constructor(props) {
    super(props);
    this.state = {
      played: 0,
      loaded: 0
    }
  }

  handleReload = () => {
    this.props.closeModal();
    this.props.reload();
  }

  render(){
    return (
      <div className="modal">
        <div className="modal--inner">
          <button onClick={this.props.closeModal} className="close" aria-label="close">&times;</button>
          <div className="player-wrapper">
            <ReactPlayer
              url={this.props.video}
              playing
              onProgress={props => this.setState({...props})}
              className="react-player"
              width="100%"
              height="100%"
            />
          </div>
          <div className="player-progress">
            <div className="player-progress-played" style={{width:`${Math.round(this.state.played * 100)}%`}}></div>
            <div className="player-progress-loaded" style={{width:`${Math.round(this.state.loaded * 100)}%`}}></div>
          </div>
          <div className="sponsorship">
            <h3 className="sponsor">Your SunJoules sponsored by {this.props.sponsor}</h3>
            {(this.state.played > .98) &&
              <button className="btn btn-primary" onClick={this.handleReload} >Get Your SunJoules</button>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default RefillModal;
