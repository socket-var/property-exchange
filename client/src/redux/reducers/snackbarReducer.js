import * as actionTypes from "../actionTypes";

const initialState = {
  message: "",
  snackbar: {
    open: false,
    type: "primary"
  }
};
export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.OPEN_SNACKBAR:
      return {
        message: action.payload.message,
        snackbar: action.payload.snackbar
      };
    case actionTypes.CLOSE_SNACKBAR:
      return {
        snackbar: action.payload.snackbar,
        message: action.payload.message
      };
    case actionTypes.CLEAR_ALL_STATE:
      return initialState;
    default:
      return state;
  }
};
