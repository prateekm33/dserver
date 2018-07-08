import "babel-polyfill";
import React from "react";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      new_pw: "",
      confirm_pw: ""
    };
    this.post_url = "";
    this.post_url += `http://localhost:3000/password_recovery/`;
    if (props.type === "vendor") this.post_url += `vendor/`;
    this.post_url += `change_password?token=`;
  }

  onSubmit = evt => {
    evt.preventDefault();
    if (this.state.new_pw !== this.state.confirm_pw) {
      this.setState({
        error: "Passwords do not match."
      });
      return;
    }
    const queries = window.location.search.slice(1).split("&");
    let token = "";
    for (let i = 0; i < queries.length; i++) {
      let [key, val] = queries[i].split("=");
      if (key === "token") {
        token = val;
        break;
      }
    }
    fetch(`${this.post_url}${token}`, {
      method: "post",
      body: JSON.stringify({
        password: this.state.new_pw
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        if (res.error) console.error(res.error.message);
        else console.log("SUCCESSFULLY CHANGED PASSWORD");
      })
      .catch(err => {
        console.error(err);
      });
  };

  updatePasswordInput = evt => {
    const value = evt.target.value;
    this.setState({ new_pw: value, error: "" });
  };
  updateConfirmPasswordInput = evt => {
    const value = evt.target.value;
    this.setState({ confirm_pw: value, error: "" });
  };

  render() {
    return (
      <div>
        {/* <Header /> */}
        <div>
          {this.state.error && (
            <div>
              <span>{this.state.error}</span>
            </div>
          )}
          <form onSubmit={this.onSubmit}>
            <input
              placeholder="New password"
              type="password"
              ref={el => (this.passwordInput = el)}
              onChange={this.updatePasswordInput}
            />
            <input
              placeholder="Confirm password"
              type="password"
              ref={el => (this.confirmPasswordInput = el)}
              onChange={this.updateConfirmPasswordInput}
            />
            <input type="submit" value="Change Password" />
          </form>
        </div>
      </div>
    );
  }
}
