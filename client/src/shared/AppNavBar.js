import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavLink as RRNavLink } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import { connect } from "react-redux";
import { signoutUser } from "../redux/actions";

class AppNavBar extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired
  };

  state = {};

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  signoutHandler = evt => {
    evt.preventDefault();
    this.props.signoutUser();
  };

  render() {
    const { role } = this.props.user;
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand tag={RRNavLink} to="/">
            PropX
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {!role && (
                <React.Fragment>
                  <NavItem>
                    <NavLink tag={RRNavLink} to="/auth/register">
                      Register
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={RRNavLink} to="/auth/login">
                      Login
                    </NavLink>
                  </NavItem>
                </React.Fragment>
              )}

              {role && (
                <React.Fragment>
                  <NavItem>
                    <NavLink>
                      {this.props.user &&
                        `Welcome ${this.props.user.ethereum_address}`}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      tag={RRNavLink}
                      to="/"
                      onClick={this.signoutHandler}
                    >
                      Logout
                    </NavLink>
                  </NavItem>
                </React.Fragment>
              )}
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  selectedAddress: state.init.accounts[0]
});

const mapDispatchToProps = {
  signoutUser
};

export default connect(mapStateToProps, mapDispatchToProps)(AppNavBar);
