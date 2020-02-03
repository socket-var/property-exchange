import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  Button
} from "reactstrap";

const GenericCard = ({ title, subtitle, content, actions, children }) => {
  actions = actions || [];
  return (
    <div>
      <Card>
        <CardImg
          top
          width="100%"
          src="https://via.placeholder.com/728x90.png?text=No+Image+Available"
          alt="No Image Available"
        />
        <CardBody>
          <CardTitle>{title}</CardTitle>
          <CardSubtitle>{subtitle}</CardSubtitle>
          <CardText>{content}</CardText>
          {actions.length > 0 &&
            actions.map((action, key) => (
              <Button key={key} onClick={action.func}>
                {action.title}
              </Button>
            ))}

          {children}
        </CardBody>
      </Card>
    </div>
  );
};

GenericCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  content: PropTypes.string,
  actions: PropTypes.array,
  children: PropTypes.node
};

export default GenericCard;
