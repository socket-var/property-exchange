import React, { Component } from "react";
import PropTypes from "prop-types";
import { Route, Switch, Redirect } from "react-router-dom";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import { connect } from "react-redux";

import { registerUser, loginUser } from "../redux/actions";

class Auth extends Component {
  static propTypes = {
    registerUser: PropTypes.func.isRequired,
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
  };

  state = {
    emailField: "",
    passwordField: "",
    confirmPasswordField: "",
    accountAddressField: "",
    registerAs: "",
    loginAs: ""
  };

  handleAuthType = name => event => {
    this.setState({ [name]: event.target.value });
  };

  onInputChange = evt => {
    this.setState({
      [evt.target.id]: evt.target.value
    });
  };

  signupHandler = async evt => {
    evt.preventDefault();

    if (this.state.passwordField !== this.state.confirmPasswordField) {
      // show error message
      console.debug("Passwords do not match");
      return;
    }

    this.props.registerUser(Object.assign({}, this.state));
  };

  loginHandler = async evt => {
    evt.preventDefault();

    this.props.loginUser(Object.assign({}, this.state));
  };

  renderAuthPage = (AuthPage, customProps) => routerProps => {
    const { role } = this.props.user;
    if (role === "CONSUMER") {
      return <Redirect to="/consumer/dashboard" />;
    } else if (role === "ESCROW") {
      return <Redirect to="/escrow/dashboard" />;
    } else {
      return <AuthPage {...routerProps} {...customProps} />;
    }
  };

  componentDidMount() {
    this.setState({
      accountAddressField: this.props.selectedAddress || ""
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedAddress !== this.props.selectedAddress) {
      this.setState({
        accountAddressField: this.props.selectedAddress
      });
    }
  }

  render() {
    const { match } = this.props;

    const { registerAs, accountAddressField } = this.state;

    const signupProps = {
      onSubmit: this.signupHandler,
      handleAuthType: this.handleAuthType,
      onInputChange: this.onInputChange,
      accountAddressField,
      registerAs
    };

    const loginProps = {
      onSubmit: this.loginHandler,
      handleAuthType: this.handleAuthType,
      onInputChange: this.onInputChange
      // TODO: low priority
      // loginAs
    };

    return (
      <Switch>
        <Route
          path={`${match.path}/register`}
          exact
          render={this.renderAuthPage(SignupPage, signupProps)}
        />
        <Route
          path={`${match.path}/login`}
          exact
          render={this.renderAuthPage(LoginPage, loginProps)}
        />
      </Switch>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    selectedAddress: state.init.accounts[0] || ""
  };
};

const mapDispatchToProps = {
  registerUser,
  loginUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
