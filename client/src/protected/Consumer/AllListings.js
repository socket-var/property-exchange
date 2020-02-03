import React, { Component } from "react";
import PropTypes from "prop-types";

import { Container, Row, Col, Form, FormGroup, Label, Input } from "reactstrap";

import GenericCard from "../../shared/GenericCard";
import GenericModal from "../../shared/GenericModal";

class AllListings extends Component {
  static propTypes = {
    allListings: PropTypes.array.isRequired,
    getAllListings: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    addEscrowToAgreement: PropTypes.func.isRequired
  };

  state = {
    selectedListing: null,
    escrowEmailField: ""
  };

  onInputChange = evt => {
    this.setState({
      [evt.target.id]: evt.target.value
    });
  };

  updateSelectedListing = async evt => {
    evt.preventDefault();
    this.setState({ selectedListing: this.props.allListings[evt.target.id] });
  };

  addEscrow = async () => {
    this.props.addEscrowToAgreement(
      Object.assign({}, this.state, { allListings: this.props.allListings }),
      this.props.user
    );
  };

  async componentDidMount() {
    this.props.getAllListings(this.props.user.token);
  }

  render() {
    const { allListings } = this.props;
    // console.log(allListings);
    return (
      <Container>
        <Row>
          {allListings.map((listing, key) => {
            return (
              <Col sm="4" key={key}>
                <GenericCard
                  key={key}
                  title={listing.address}
                  subtitle={`Price: ${listing.price} eth`}
                  content={listing.description}
                  // actions={[{ title: "Book Escrow", func: }]}
                >
                  Owner: {listing.owner.email}
                  <GenericModal
                    modalTitle={"Book Escrow"}
                    buttonLabel={"Book Escrow"}
                    primaryAction={{
                      buttonLabel: "Confirm Escrow",
                      action: this.addEscrow
                    }}
                    secondaryActionLabel={"Cancel"}
                    onModalButtonClick={this.updateSelectedListing}
                    keyProp={key}
                  >
                    <Form>
                      <FormGroup>
                        <Label for="escrowEmailField">Escrow's email:</Label>
                        <Input
                          type="email"
                          name="escrowEmailField"
                          id="escrowEmailField"
                          placeholder="escrow@org.com"
                          onChange={this.onInputChange}
                        />
                      </FormGroup>
                    </Form>
                  </GenericModal>
                </GenericCard>
              </Col>
            );
          })}
        </Row>
      </Container>
    );
  }
}

export default AllListings;
