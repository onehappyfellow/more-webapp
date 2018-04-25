import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

class LoginForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      phone: '',
      code: '',
      message: '',
      phoneSubmitted: false
    };
  }

  handlePhoneChange = (e) => {
    this.setState({ phone: e.target.value });
  }

  handlePhoneSubmit = async (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    try {
      const response = await axios.post('/api/login', {
        phone: this.state.phone
      });
      // if a success code is received from the server, go on to the next step, otherwise reset the form
      if (response.data.success) {
        // the phone number is not being set because server side validation adds a country code
        this.setState({ message: response.data.message, phoneSubmitted: true });
      } else {
        this.setState({ message: response.data.message, phoneSubmitted: false, phone: '' });
      }
    } catch (error) {
      console.error(error);
    }
  }

  handleCodeChange = (e) => {
    this.setState({ code: e.target.value });
  }

  handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', {
        phone: this.state.phone,
        code: this.state.code
      });
      // if a success code is received from the server, go on to the next step, otherwise reset the form
      if (response.data.success) {
        this.props.setUser(response.data.user);
      } else {
        this.setState({ message: response.data.message, phoneSubmitted: false, phone: '', code: '' });
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <div>
      { !this.state.phoneSubmitted
        ? <form className="login--form" onSubmit={this.handlePhoneSubmit}>
            <div className="login-message">{this.state.message}</div>
            <input className="form-control" value={this.state.phone} onChange={this.handlePhoneChange} type="text" placeholder="Your mobile number..." />
            <button className="btn btn-primary" type="submit">Go</button>
          </form>
        : <form className="login--form" onSubmit={this.handleCodeSubmit}>
            <div className="login-message">{this.state.message}</div>
            <input className="form-control" value={this.state.code} onChange={this.handleCodeChange} type="text" placeholder="Your verification code..." />
            <button className="btn btn-primary" type="submit">Submit</button>
          </form>
      }
      </div>
    );
  }
}

LoginForm.propTypes = {
  setUser: PropTypes.func.isRequired
};

export default LoginForm;
