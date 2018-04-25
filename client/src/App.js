import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Streak from './components/Streak';
import Fill from './components/Fill';
import SettingsModal from './components/SettingsModal';
import RefillModal from './components/RefillModal';
import WelcomeModal from './components/WelcomeModal';
import viaBlockchain from './images/via-blockchain.svg';
import useSolarGetMore from './images/login-banner.svg';

class App extends Component {
  constructor() {
    super();
    this.state = {
      modal: {
        name: '',
        alert: ''
      }
    };
  }

  setUser = (user) => {
    this.setState({ user });
  }

  getTransactions = async () => {
    const user = this.state.user;
    try {
      const response = await axios.post('/api', {
        action: 'getTransactions',
        user: { _id: user._id }
      });
      this.setState({ user: { ...user, history: response.data.history }});
    } catch (error) {
      console.error(error);
    }
  }

  setAppMultiplier = async (change) => {
    const state = this.state;
    const multiplier = Math.round((state.user.multiplier + change) * 10) / 10;
    try {
      const response = await axios.post('/api', {
        action: 'setAppMultiplier',
        user: { _id: state.user._id, multiplier }
      });
      if (response.data.success) {
        this.setState({ user: { ...state.user, multiplier: response.data.user.multiplier }});
      } else {
        this.setState({ modal: { ...state.modal, alert: response.data.message }});
        setTimeout(() => {
          const modal = this.state.modal;
          this.setState({ modal: { ...modal, alert: '' }});
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    }
  }

  getSunJoulesForApp = async () => {
    const user = this.state.user;
    try {
      const response = await axios.post('/api', {
        action: 'refillSunJoulesForApp',
        user: { _id: user._id }
      });
      if (response.data.success) {
        this.setState({ user: { ...user, ...response.data.user }});
      }
    } catch (error) {
      console.error(error);
    }
  }

  openModal = (openModal) => {
    this.setState({ modal: { name: openModal }});
  }
  closeModal = () => {
    this.setState({ modal: { name: '' }});
  }
  closePageModal = () => {
    const user = this.state.user;
    this.setState({ user: { ...user, show_page: '' }});
    axios.post('/api',{
      action:'setData',
      user:{_id:user._id, show_page:''}
    });
  }
  logout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/logout');
      if (response.data.success) {
        this.setState({ user: null, modal: { name: '', alert: '' }});
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const user = this.state.user || null;
    const { modal } = this.state;

    return (
      <div className="app">
        { !user
          ? <div className="login">
              <div className="login--header">
                <img src={useSolarGetMore} className="useSolarGetMore" alt="Use Solar Get More" />
              </div>
              <LoginForm setUser={this.setUser} />
              <div className="login--footer">
                <img src={viaBlockchain} className="viaBlockchain" alt="Via Blockchain" />
              </div>
            </div>
          : <div className="screen">
              <Header sj_used={user.sj_used} mt_account={user.mt_account} openModal={this.openModal} />
              <Streak solar_streak={user.solar_streak} sj_account={user.sj_account} openModal={this.openModal} />
              <Fill sj_account={user.sj_account} />
              { modal.name === "settings" &&
                <SettingsModal
                  key="settings"
                  user={user}
                  alert={modal.alert}
                  logout={this.logout}
                  closeModal={this.closeModal}
                  getTransactions={this.getTransactions}
                  incrementMultiplier={this.setAppMultiplier}
                />
              }
              { modal.name === "refill" &&
                <RefillModal
                  video="https://youtu.be/3jMNNcatpog"
                  sponsor="CloudSolar"
                  closeModal={this.closeModal}
                  reload={this.getSunJoulesForApp}
                />
              }
              { this.state.user && this.state.user.show_page && this.state.user.show_page === "welcome" &&
                <WelcomeModal closeModal={this.closePageModal} />
              }
            </div>
        }
      </div>
    );
  }

  componentDidMount() {
    const loadData = async () => {
      try {
        const response = await axios.post('/api', {
          action: 'useSunJoulesForApp'
        });
        if (response.data.success) {
          this.setState({ user: response.data.user });
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadData();
  }

}

export default App;
