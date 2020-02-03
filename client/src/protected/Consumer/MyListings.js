import React, { Component } from "react";
import PropTypes from "prop-types";
import GenericCard from "../../shared/GenericCard";

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";

class MyListings extends Component {
  static propTypes = {
    myListings: PropTypes.array.isRequired,
    getMyListings: PropTypes.func.isRequired,
    addNewProperty: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
  };

  state = {
    addressField: "",
    priceField: "",
    propertyIdField: "",
    escrowEmailField: ""
  };

  onInputChange = evt => {
    this.setState({
      [evt.target.id]: evt.target.value
    });
  };

  onSubmit = async evt => {
    evt.preventDefault();

    this.props.addNewProperty(
      Object.assign({}, this.state, { myListings: this.props.myListings }),
      this.props.user
    );
  };

  async componentDidMount() {
    this.props.getMyListings(this.props.user.token);
  }

  render() {
    const { myListings } = this.props;
    return (
      <div>
        <Container>
          <Row>
            <Col>
              <Form onSubmit={this.onSubmit}>
                <h2 style={{ textAlign: "center" }}>Add new Listing</h2>
                <FormGroup>
                  <Label for="propertyIdField">Unique Property ID</Label>
                  <Input
                    type="text"
                    name="propertyIdField"
                    id="propertyIdField"
                    placeholder="1092103293934"
                    onChange={this.onInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="addressField">Address</Label>
                  <Input
                    type="text"
                    name="addressField"
                    id="addressField"
                    placeholder="129 Sheridan Drive"
                    onChange={this.onInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="priceField">Price in ether:</Label>
                  <Input
                    type="number"
                    name="priceField"
                    id="priceField"
                    placeholder="100"
                    onChange={this.onInputChange}
                  />
                </FormGroup>
                <Button type="submit" className="bg-primary">
                  Add Listing
                </Button>
              </Form>
            </Col>
          </Row>

          <Row>
            {myListings.map((listing, key) => {
              return (
                <Col sm="4" key={key}>
                  <GenericCard
                    key={key}
                    title={listing.address}
                    subtitle={`Price: ${listing.price} eth`}
                    content={listing.description}
                    actions={[{ title: "Remove Listing", func: () => {} }]}
                  />
                </Col>
              );
            })}
          </Row>
        </Container>
      </div>
    );
  }
}

export default MyListings;
