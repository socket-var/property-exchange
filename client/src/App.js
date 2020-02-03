import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { initApp } from "./redux/actions";

import routes from "./routes/appRoutes";
import AppNavBar from "./shared/AppNavBar";
import AppSnackbar from "./shared/AppSnackbar";
import ConsumerLandingPage from "./protected/Consumer/ConsumerLandingPage";
import EscrowLandingPage from "./protected/Escrow/EscrowLandingPage";

class App extends Component {
  async componentDidMount() {
    this.props.initApp();
  }
  render() {
    const { role } = this.props.user;

    return (
      <Router>
        <AppNavBar />
        {routes.map(route => {
          return (
            <Route
              key={route.path}
              path={route.path}
              component={route.component}
              exact={route.exact}
            />
          );
        })}

        <Route
          path="/consumer/dashboard"
          render={props =>
            role !== "CONSUMER" ? (
              <Redirect to="/auth/login" />
            ) : (
              <ConsumerLandingPage {...props} />
            )
          }
        />
        <Route
          path="/escrow/dashboard"
          render={props =>
            role !== "ESCROW" ? (
              <Redirect to="/auth/login" />
            ) : (
              <EscrowLandingPage {...props} />
            )
          }
        />
        <AppSnackbar />
      </Router>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user
  };
};

const mapDispatchToProps = {
  initApp
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
