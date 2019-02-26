import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: " ",
      password: " ",
      loggedIn: false
    };
  }
  render() {
    return (
      <div className="everything">
      <div className="welcome">
      <h1>Welcome!</h1>
      <div>
        <br></br>
        <div className= "login">

        <form className="input">
         <input
         type="text"
          name="username"
          placeholder="Username"
          value={this.state.username}
          onChange={this.changes}
              />
          <hr />
          <input
           type="text"
           name="password"
           placeholder="password"
           value={this.state.password}
           onChange={this.changes}
              />
              <hr />

         <button onClick={this.logInOther}>
         <strong>LOGIN</strong>
         </button>
          </form>
        </div>
      </div>
      </div>
      </div>
     
    )}
}

export default App;
