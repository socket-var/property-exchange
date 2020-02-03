import React, { Component } from "react";
import PropTypes from "prop-types";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import { connect } from "react-redux";
import classnames from "classnames";
import AllListings from "./AllListings";
import MyListings from "./MyListings";
import MyAgreements from "../common/MyAgreements";

import {
  getAllListings,
  getMyAgreements,
  getMyListings,
  addNewProperty,
  addEscrowToAgreement,
  updateAgreements,
  signAgreement,
  transferProperty,
  makeTransfer
} from "../../redux/actions";

class ConsumerLandingPage extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: 1
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const {
      allListings,
      myListings,
      myAgreements,
      addNewProperty,
      getAllListings,
      getMyAgreements,
      getMyListings,
      user,
      addEscrowToAgreement,
      updateAgreements,
      signAgreement,
      transferProperty,
      makeTransfer
    } = this.props;
    return (
      <div>
        <Nav tabs>
          {["Explore Properties", "Add New Listing", "MyAgreements"].map(
            (title, key) => {
              return (
                <NavItem key={key}>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === key + 1
                    })}
                    onClick={() => {
                      this.toggle(key + 1);
                    }}
                  >
                    {title}
                  </NavLink>
                </NavItem>
              );
            }
          )}
        </Nav>
        <TabContent style={{ marginTop: "2em" }}>
          {[
            <AllListings
              allListings={allListings}
              getAllListings={getAllListings}
              addEscrowToAgreement={addEscrowToAgreement}
              user={user}
            />,
            <MyListings
              user={user}
              myListings={myListings}
              getMyListings={getMyListings}
              addNewProperty={addNewProperty}
            />,
            <MyAgreements
              myAgreements={myAgreements}
              getMyAgreements={getMyAgreements}
              updateAgreements={updateAgreements}
              signAgreement={signAgreement}
              transferProperty={transferProperty}
              makeTransfer={makeTransfer}
              user={user}
            />
          ].map((component, key) => {
            return (
              this.state.activeTab === key + 1 && (
                <TabPane key={key}>{component}</TabPane>
              )
            );
          })}
        </TabContent>
      </div>
    );
  }
}

ConsumerLandingPage.propTypes = {
  user: PropTypes.object.isRequired,
  allListings: PropTypes.array.isRequired,
  myListings: PropTypes.array.isRequired,
  myAgreements: PropTypes.array.isRequired,

  getAllListings: PropTypes.func.isRequired,
  getMyListings: PropTypes.func.isRequired,
  getMyAgreements: PropTypes.func.isRequired,
  addNewProperty: PropTypes.func.isRequired,
  addEscrowToAgreement: PropTypes.func.isRequired,
  updateAgreements: PropTypes.func.isRequired,
  transferProperty: PropTypes.func.isRequired,
  makeTransfer: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    allListings: state.pxData.allListings,
    myListings: state.pxData.myListings,
    myAgreements: state.pxData.myAgreements
  };
};

const mapDispatchToProps = {
  getAllListings,
  getMyListings,
  getMyAgreements,
  addNewProperty,
  addEscrowToAgreement,
  updateAgreements,
  signAgreement,
  transferProperty,
  makeTransfer
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConsumerLandingPage);
