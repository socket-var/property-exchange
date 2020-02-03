import React from "react";
import PropTypes from "prop-types";
import MyAgreements from "../common/MyAgreements";
import { connect } from "react-redux";
import {
  getMyAgreements,
  updateAgreements,
  transferProperty
} from "../../redux/actions";

const EscrowLandingPage = ({
  user,
  myAgreements,
  getMyAgreements,
  updateAgreements,
  transferProperty
}) => {
  return (
    <div>
      <MyAgreements
        user={user}
        myAgreements={myAgreements}
        getMyAgreements={getMyAgreements}
        updateAgreements={updateAgreements}
        transferProperty={transferProperty}
      />
    </div>
  );
};

EscrowLandingPage.propTypes = {
  getMyAgreements: PropTypes.func.isRequired,
  updateAgreements: PropTypes.func.isRequired,
  transferProperty: PropTypes.func
};

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    myAgreements: state.pxData.myAgreements
  };
};

const mapDispatchToProps = {
  getMyAgreements,
  updateAgreements,
  transferProperty
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EscrowLandingPage);
