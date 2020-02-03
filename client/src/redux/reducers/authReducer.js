import * as actionTypes from "../actionTypes";

const initialState = { user: {} };

export default (state = Object.assign({}, initialState), action) => {
  switch (action.type) {
    case actionTypes.REGISTER_USER_SUCCESS:
    case actionTypes.LOGIN_USER_SUCCESS:
      return { user: action.payload.user };
    case actionTypes.REGISTER_USER_FAILED:
    case actionTypes.LOGIN_USER_FAILED:
      // TODO: better error handling
      return state;
    case actionTypes.LOGOUT_USER_SUCCESS:
      return initialState;
    default:
      return state;
  }
};
