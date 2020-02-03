import React from "react";
import { Link } from "react-router-dom";
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

const LoginPage = ({ onInputChange, onSubmit, handleAuthType }) => {
  return (
    <Container>
      <Row>
        <Col>
          <Form onSubmit={onSubmit}>
            <h2 style={{ textAlign: "center" }}>Login</h2>
            <FormGroup>
              <Label for="emailField">Email</Label>
              <Input
                type="email"
                name="email"
                id="emailField"
                placeholder="example@domain.com"
                // value={emailField}
                onChange={onInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="passwordField">Password</Label>
              <Input
                type="password"
                name="password"
                id="passwordField"
                placeholder="xxxxxxxx"
                // value={passwordField}
                onChange={onInputChange}
              />
            </FormGroup>

            <FormGroup check>
              <Label check>
                <Input type="checkbox" checked onChange={onInputChange} />{" "}
                Remember me
              </Label>
            </FormGroup>

            <p>
              <Link to="/auth/register">Create Account</Link>
            </p>

            <Button type="submit">Login</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
