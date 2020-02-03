import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { closeAppSnackbar } from "../redux/actions";
import { Toast, ToastBody } from "reactstrap";
import "./AppSnackbar.css";

class AppSnackbar extends Component {
  static propTypes = {
    snackbar: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired,
    closeAppSnackbar: PropTypes.func.isRequired
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.snackbar &&
      this.props.snackbar.open &&
      this.props.snackbar.open !== prevProps.snackbar.open
    ) {
      setTimeout(() => {
        this.props.closeAppSnackbar();
      }, 5000);
    }
  }

  render() {
    const { message, snackbar } = this.props;
    return (
      <div className="appSnackbar">
        <Toast
          isOpen={snackbar && snackbar.open}
          className={[
            snackbar && snackbar.type ? `bg-${snackbar.type}` : "",
            "p-1",
            "my-2",
            "rounded"
          ].join(" ")}
        >
          <ToastBody>
            <p
              style={{
                color: "white"
              }}
            >
              {message}
            </p>
          </ToastBody>
        </Toast>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  snackbar: state.appSnackbar.snackbar,
  message: state.appSnackbar.message
});

const mapDispatchToProps = {
  closeAppSnackbar
};

export default connect(mapStateToProps, mapDispatchToProps)(AppSnackbar);
