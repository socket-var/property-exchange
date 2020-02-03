import React from "react";
import { Jumbotron } from "reactstrap";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div>
      <Jumbotron className="app-jumbotron">
        <h1 className="display-4">Property Exchange</h1>
        <p className="lead">
          Welcome to Property Exchange! Signup or login to buy and sell real
          estate properties
        </p>
        <hr className="my-2" />
        <p>
          It uses blockchain technology for authenticity, verification and
          accountability.
        </p>
      </Jumbotron>
    </div>
  );
};

export default HomePage;
