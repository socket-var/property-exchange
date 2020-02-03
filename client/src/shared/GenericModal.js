import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import PropTypes from "prop-types";

class GenericModal extends React.Component {
  static propTypes = {
    buttonLabel: PropTypes.string.isRequired,
    color: PropTypes.string,
    children: PropTypes.node,
    // primaryAction: {
    //   buttonLabel: PropTypes.string,
    //   action: PropTypes.func
    // },
    primaryAction: PropTypes.object,
    secondaryActionLabel: PropTypes.string,
    keyProp: PropTypes.number,
    onModalButtonClick: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  clickHandler = fn => async evt => {
    evt.preventDefault();

    await fn();
  };

  closeHandler = evt => {
    evt.preventDefault();

    this.toggle();
  };

  toggle(fn, evt) {
    if (fn) {
      fn(evt);
    }
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  render() {
    const {
      modalTitle,
      buttonLabel,
      primaryAction,
      secondaryActionLabel,
      color,
      onModalButtonClick,
      keyProp
    } = this.props;

    return (
      <div>
        <Button
          color={color || "primary"}
          onClick={this.toggle.bind(null, onModalButtonClick)}
          id={keyProp}
        >
          {buttonLabel}
        </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle.bind(null, null)}>
          <ModalHeader toggle={this.toggle.bind(null, null)}>
            {modalTitle}
          </ModalHeader>
          <ModalBody>{this.props.children}</ModalBody>
          <ModalFooter>
            {primaryAction && primaryAction.buttonLabel && (
              <Button
                color="primary"
                onClick={this.clickHandler(primaryAction.action)}
              >
                {primaryAction.buttonLabel}
              </Button>
            )}{" "}
            <Button color="secondary" onClick={this.toggle.bind(null, null)}>
              {secondaryActionLabel || "Cancel"}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default GenericModal;
