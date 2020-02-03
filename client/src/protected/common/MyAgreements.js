import React, { Component } from "react";
import PropTypes from "prop-types";

import { Badge } from "reactstrap";

import { Container, Row, Col, Button } from "reactstrap";

import GenericCard from "../../shared/GenericCard";
// import GenericModal from "../../shared/GenericModal";
import * as actionTypes from "../../redux/actionTypes";

class MyAgreements extends Component {
  static propTypes = {
    myAgreements: PropTypes.array,
    getMyAgreements: PropTypes.func.isRequired,
    generateAgreement: PropTypes.func,
    user: PropTypes.object.isRequired,
    updateAgreements: PropTypes.func.isRequired,
    transferProperty: PropTypes.func,
    makeTransfer: PropTypes.func
  };

  onInputChange = evt => {
    this.setState({
      [evt.target.id]: evt.target.value
    });
  };

  generateAgreement = async evt => {
    evt.preventDefault();

    const selectedAgreement = this.props.myAgreements[evt.target.id];
    this.props.updateAgreements(
      Object.assign(
        {},
        {
          myAgreements: this.props.myAgreements,
          selectedAgreement
        }
      ),
      this.props.user.token,
      "generate-agreement",
      {
        agreementId: selectedAgreement.id
      },
      actionTypes.GENERATE_AGREEMENT
    );
  };

  signAgreement = async evt => {
    evt.preventDefault();

    const selectedAgreement = this.props.myAgreements[evt.target.id];

    this.props.signAgreement(
      Object.assign(
        {},
        {
          myAgreements: this.props.myAgreements,
          selectedAgreement
        }
      ),
      this.props.user,
      "sign-agreement",
      {
        agreementId: selectedAgreement.id
      },
      actionTypes.SIGN_AGREEMENT
    );
  };

  makePayment = async evt => {
    evt.preventDefault();

    const selectedAgreement = this.props.myAgreements[evt.target.id];

    this.props.makeTransfer(
      Object.assign(
        {},
        {
          myAgreements: this.props.myAgreements,
          selectedAgreement
        }
      ),
      this.props.user,
      "make-payment",
      {
        agreementId: selectedAgreement.id,
        price: selectedAgreement.property.price
      },
      actionTypes.MAKE_PAYMENT
    );
  };

  transferProperty = async evt => {
    evt.preventDefault();
    // update agreement status to AGREEMENT_GENERATED
    const selectedAgreement = this.props.myAgreements[evt.target.id];
    console.debug("calling");
    this.props.transferProperty(
      Object.assign(
        {},
        {
          myAgreements: this.props.myAgreements,
          selectedAgreement
        }
      ),
      this.props.user,
      "transfer-property",
      {
        agreementId: selectedAgreement.id
      },
      actionTypes.TRANSFER_PROPERTY
    );
  };

  async componentDidMount() {
    this.props.getMyAgreements(this.props.user.token);
  }

  renderEscrowFields(agreement, key) {
    return (
      <div>
        {agreement.status === "INIT" && (
          <Button onClick={this.generateAgreement} id={key}>
            Generate Agreement
          </Button>
        )}
        {agreement.status === "TRANSFER_FROM_ESCROW_PENDING" && (
          <Button onClick={this.transferProperty} id={key}>
            Transfer property
          </Button>
        )}
      </div>
    );
  }

  renderBuyerFields(agreement, key) {
    return (
      <div>
        {agreement.status === "TRANSFER_TO_ESCROW_PENDING" && (
          <Button onClick={this.makePayment} id={key}>
            Make payment
          </Button>
        )}
      </div>
    );
  }

  renderConsumerFields(agreement, key) {
    return (
      <div>
        {(agreement.status === "AGREEMENT_GENERATED" ||
          agreement.status === "BUYER_SIGNATURE_PENDING" ||
          agreement.status === "SELLER_SIGNATURE_PENDING") && (
          <Button onClick={this.signAgreement} id={key}>
            Sign Agreement
          </Button>
        )}
      </div>
    );
  }

  generateCards = (agreement, key) => {
    const { user } = this.props;
    return (
      <Col sm="4" key={key}>
        <GenericCard
          key={key}
          title={agreement.property.address}
          subtitle={`Price: $${agreement.property.price}`}
        >
          <Badge>Agreement Status: {agreement.status}</Badge>
          <div>
            <div>
              Buyer email:{" "}
              {agreement.buyer[0].email !== user.email
                ? agreement.buyer[0].email
                : "You"}
            </div>
            <div>
              Seller email:{" "}
              {agreement.seller[0].email !== user.email
                ? agreement.seller[0].email
                : "You"}
            </div>
            <div>
              Escrow email:{" "}
              {agreement.escrow[0].email !== user.email
                ? agreement.escrow[0].email
                : "You"}
            </div>
            <div>
              {user.role === "ESCROW" &&
                this.renderEscrowFields(agreement, key)}
            </div>
            <div>
              {user.role === "CONSUMER" &&
                agreement.seller[0].id !== user.id &&
                this.renderBuyerFields(agreement, key)}
            </div>
            <div>
              {user.role === "CONSUMER" &&
                this.renderConsumerFields(agreement, key)}
            </div>
          </div>
        </GenericCard>
      </Col>
    );
  };

  render() {
    const { myAgreements } = this.props;

    return (
      <Container>
        <Row>{myAgreements.map(this.generateCards)}</Row>
      </Container>
    );
  }
}

export default MyAgreements;
