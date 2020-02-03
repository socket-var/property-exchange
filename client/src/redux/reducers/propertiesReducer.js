import * as actionTypes from "../actionTypes";

const initialState = { allListings: [], myListings: [], myAgreements: [] };

export default (state = Object.assign({}, initialState), action) => {
  switch (action.type) {
    case actionTypes.LOAD_ALL_LISTINGS:
      return {
        allListings: action.payload.allListings,
        myListings: [],
        myAgreements: []
      };
    case actionTypes.ADD_NEW_PROPERTY:
    case actionTypes.LOAD_MY_LISTINGS:
      return {
        myListings: action.payload.myListings,
        allListings: [],
        myAgreements: []
      };
    case actionTypes.ADD_ESCROW_TO_AGREEMENT:
    case actionTypes.LOAD_MY_AGREEMENTS:
    case actionTypes.GENERATE_AGREEMENT:
    case actionTypes.SIGN_AGREEMENT:
    case actionTypes.MAKE_PAYMENT:
    case actionTypes.TRANSFER_PROPERTY:
      return {
        myListings: [],
        allListings: [],
        myAgreements: action.payload.myAgreements
      };
    case actionTypes.CLEAR_ALL_STATE:
      return initialState;
    default:
      return state;
  }
};
