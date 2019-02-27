import React from "react";
import axios from "axios";

import ".App.css";

import App from "../App";

class Login extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = {
        username: "",
        password: "",
        loggedIn: false
      };
    }
  
    changes = event => {
      this.setState({ [event.target.name]: event.target.value });
    };
  
    logInOther = event => {
        event.preventDefault();
        const baseUrl = ("https://bookr-app-backend.herokuapp.com/api/user-access/login");
        console.log("line23");
  
      axios
        .post(baseUrl, this.state)
        .then(res => { 
            console.log(res);
            localStorage.setItem("jwt", res.data.token)
            localStorage.setItem("user_id", res.data.user_id)
            localStorage.setItem("username", res.data.username)
            this.setState({ loggedIn: true })
            this.props.history.push('/books');
      })
      .catch(err => console.log(err));
  
      if (this.state.username) {
          console.log(this.state);
          return < App />
      } else {
      //   return <App />;
      }
    };
  
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

    export default Login;