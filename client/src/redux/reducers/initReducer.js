import { INIT_APP, REFRESH_ACCOUNTS } from "../actionTypes";

const initialState = {
  web3: null,
  accounts: [],
  contract: null
};
export default (state = Object.assign({}, initialState), action) => {
  switch (action.type) {
    case INIT_APP:
    case REFRESH_ACCOUNTS:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
