import { OPEN_SNACKBAR } from "./redux/actionTypes";
const ajaxErrorHandler = (error, dispatch) => {
  let message;
  if (error.response) {
    // console.error(error.response);
    message = error.response.data.message;
  } else if (error.request) {
    // console.error(error.request);
    message = "Request timed out, try again";
  } else {
    message = "Unknown error. Try again";
    console.error(error);
  }
  if (dispatch) {
    dispatch({
      type: OPEN_SNACKBAR,
      payload: { message, snackbar: { open: true, type: "danger" } }
    });
  }
};

export default ajaxErrorHandler;
