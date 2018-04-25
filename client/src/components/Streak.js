import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Streak extends Component {
  render(){
    const solar = this.props.sj_account > 0;
    const days = this.props.solar_streak;

    let message;
    if (!solar) {
      message = "Not using solar";
    } else if (days < 2) {
      message = "Currently using solar";
    } else {
      message = `${days} Days using solar`;
    }

    return (
      <div
        className="streak-wrapper"
        onClick={() => this.props.openModal("refill")}
        aria-label="tap to refill SunJoules"
      >
        { solar
          ? <div className="animation-sun">
              {sunIcon}
            </div>
          : <div className="animation-coal">
              {coalIcon}
            </div>
        }
        <p>{message}</p>
      </div>
    );
  }
}

Streak.propTypes = {
  sj_account: PropTypes.number.isRequired,
  solar_streak: PropTypes.number.isRequired,
  openModal: PropTypes.func.isRequired
};

const sunIcon = <svg width="100%" height="auto" version="1.1" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-2.397 -215.36)" fill="none" stroke="#4d4d4d" strokeLinecap="round" strokeWidth="2.9984"><circle transform="rotate(22.883)" cx="138.36" cy="218.78" r="24.679" strokeLinejoin="round"/><g><path className="stroke s5" d="m30.773 282.9-4.1081 9.7337"/><path className="stroke s1" d="m54.021 227.82 4.1083-9.7337"/><path className="stroke s6" d="m14.704 266.61-9.7876 3.9778"/><path className="stroke s2" d="m70.09 244.1 9.7877-3.9778"/><path className="stroke s7" d="m14.856 243.74-9.7337-4.1082"/><path className="stroke s3" d="m69.937 266.98 9.7336 4.1082"/><path className="stroke s8" d="m31.142 227.67-3.9778-9.7877"/><path className="stroke s4" d="m53.652 283.05 3.9778 9.7877"/></g></g></svg>;
const coalIcon = <svg width="100%" height="auto" version="1.1" viewBox="0 0 73.747322 120.87647" xmlns="http://www.w3.org/2000/svg"><g transform="translate(67.868 -114.96)" stroke="#4d4d4d"><g transform="matrix(.26458 0 0 .26458 -110.37 136.78)" strokeWidth="8"><path d="m232.27 145.93c-5.2891 0-9.5472 4.258-9.5472 9.5472v110.93h-0.80181v-77.403c0-5.2891-4.258-9.5472-9.5472-9.5472h-38.189c-5.2891 0-9.5472 4.258-9.5472 9.5472v171.85c0 5.2891 4.258 9.5472 9.5472 9.5472h251.53c5.2891 0 9.5472-4.258 9.5472-9.5472v-22.413c0.0433-0.35188 0.10565-0.69895 0.10565-1.0629v-86.664c0-4.7309-3.7622-8.5351-8.4656-8.6459v6e-3c-1.0713 0.036-2.1571 0.25523-3.201 0.71479l-42.154 18.566v-10.641c0-4.7309-3.7622-8.5351-8.4656-8.6459v6e-3c-1.0713 0.036-2.1571 0.25522-3.201 0.71479l-42.148 18.56v-10.635c0-4.7309-3.7622-8.5351-8.4656-8.6459v6e-3c-1.0714 0.036-2.157 0.25522-3.201 0.71479l-36.057 15.881v-103.19c0-5.2891-4.258-9.5472-9.5472-9.5472z" fill="none" stroke="#4d4d4d" strokeLinejoin="round" strokeWidth="8"/></g><path className="c1" d="m-44.261 169.62c-10.706-18.499 17.422-26.443 11.15-54.429" fill="none" strokeWidth="2.1167"/><path className="c2" d="m-60.564 177.64c-10.706-18.499 17.422-26.443 11.15-54.429" fill="none" strokeWidth="2.1167"/></g></svg>;

export default Streak;
