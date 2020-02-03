import * as actionTypes from "./actionTypes";
import axios from "axios";
import ajaxErrorHandler from "../utils";
import pxContract from "../ethereum/contracts/PropertyExchange.json";

import getWeb3 from "../ethereum/getWeb3";

export const initApp = () => async (dispatch, getState) => {
  try {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();

    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = pxContract.networks[networkId];
    const instance = new web3.eth.Contract(
      pxContract.abi,
      deployedNetwork && deployedNetwork["address"]
    );

    dispatch({
      type: actionTypes.INIT_APP,
      payload: {
        web3,
        accounts,
        contract: instance
      }
    });

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts => {
        dispatch({
          type: actionTypes.REFRESH_ACCOUNTS,
          payload: {
            accounts
          }
        });
      });
    } else if (window.web3) {
      const account = web3.eth.accounts[0];
      setInterval(function() {
        if (web3.eth.accounts[0] !== account) {
          dispatch({
            type: actionTypes.REFRESH_ACCOUNTS,
            payload: {
              accounts
            }
          });
        }
      }, 1000);
    }
  } catch (error) {
    // Catch any errors for any of the above operations.
    console.error(error);
    // ajaxErrorHandler(err, dispatch);
  }
};

export const registerUser = formFields => async (dispatch, getState) => {
  const {
    emailField,
    passwordField,
    confirmPasswordField,
    accountAddressField,
    registerAs
  } = formFields;

  if (passwordField === confirmPasswordField) {
    const isEscrow = registerAs === "ESCROW";

    try {
      // TODO: check deposit field for optimal value
      const resultBC = await getState()
        .init.contract.methods.register(isEscrow)
        .send({
          from: window.ethereum.selectedAddress
        });
      console.debug(resultBC);
    } catch (err) {
      console.error(err);
      return err;
    }

    try {
      const result = await axios.post("/api/auth/signup", {
        email: emailField,
        password: passwordField,
        user_type: registerAs,
        ethereum_address: accountAddressField
      });

      const { user } = result.data;

      dispatch({
        type: actionTypes.REGISTER_USER_SUCCESS,
        payload: { user }
      });

      dispatch({
        type: actionTypes.OPEN_SNACKBAR,
        payload: {
          message: result.data.message,
          snackbar: { open: true, type: "success" }
        }
      });
    } catch (err) {
      // TODO: use color based on type
      ajaxErrorHandler(err, dispatch);
    }
  } else {
    console.error("Passwords do not match");
    dispatch({
      type: actionTypes.OPEN_SNACKBAR,
      payload: {
        message: "Passwords do not match",
        snackbar: { open: true, type: "danger" }
      }
    });
  }
};

export const loginUser = formFields => async dispatch => {
  const { emailField, passwordField, loginAs } = formFields;

  try {
    const result = await axios.post("/api/auth/login", {
      email: emailField,
      password: passwordField,
      userType: loginAs
    });

    const { user } = result.data;

    dispatch({
      type: actionTypes.LOGIN_USER_SUCCESS,
      payload: { user }
    });

    dispatch({
      type: actionTypes.OPEN_SNACKBAR,
      payload: {
        message: result.data.message,
        snackbar: { open: true, type: "success" }
      }
    });
  } catch (err) {
    // TODO: use color based on type
    ajaxErrorHandler(err, dispatch);
  }
};

export const signoutUser = () => dispatch => {
  dispatch({
    type: actionTypes.LOGOUT_USER_SUCCESS,
    payload: { user: {} }
  });

  dispatch({
    type: actionTypes.CLEAR_ALL_STATE,
    payload: { user: {} }
  });
};

export const openAppSnackbar = (message, type) => {
  return {
    type: actionTypes.OPEN_SNACKBAR,
    payload: { message, snackbar: { open: true, type } }
  };
};

export const closeAppSnackbar = () => {
  return {
    type: actionTypes.CLOSE_SNACKBAR,
    payload: { snackbar: { open: false }, message: "" }
  };
};

export const getAllListings = token => async dispatch => {
  try {
    const result = await axios.get("/api/listings/all-listings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({
      type: actionTypes.LOAD_ALL_LISTINGS,
      payload: { allListings: result.data.allListings }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const getMyListings = token => async dispatch => {
  try {
    const result = await axios.get("/api/listings/my-listings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({
      type: actionTypes.LOAD_MY_LISTINGS,
      payload: { myListings: result.data.myListings }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const getMyAgreements = token => async dispatch => {
  try {
    const result = await axios.get("/api/agreements/my-agreements", {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({
      type: actionTypes.LOAD_MY_AGREEMENTS,
      payload: { myAgreements: result.data.myAgreements }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const addNewProperty = (
  { addressField, priceField, propertyIdField, myListings },
  user
) => async (dispatch, getState) => {
  let resultBC, getEvents;
  try {
    resultBC = await getState()
      .init.contract.methods.addNewProperty(
        parseInt(propertyIdField),
        parseInt(priceField)
      )
      .send({
        from: user.ethereum_address
      });
    console.debug(resultBC);

    getEvents = await getState().init.contract.getPastEvents("CoinGenerated", {
      toBlock: "latest",
      filter: {
        _propertyId: propertyIdField
      }
    });
    // console.debug(getEvents);
  } catch (err) {
    console.error(err);
    return err;
  }
  // TODO: add transaction hash on the server's database
  try {
    const result = await axios.post(
      "/api/listings/new-listing",
      {
        address: addressField,
        price: priceField,
        UPID: propertyIdField,
        coin_id: getEvents[0].returnValues._coinId
      },
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );
    console.debug(myListings);
    myListings = [result.data.newListing, ...myListings];

    dispatch({
      type: actionTypes.ADD_NEW_PROPERTY,
      payload: { myListings }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const addEscrowToAgreement = (
  { escrowEmailField, selectedListing, allListings },
  user
) => async (dispatch, getState) => {
  try {
    // lookup escrow ether address using email
    const escrowObj = await axios.post(
      "/api/auth/lookup-escrow",
      {
        escrowEmail: escrowEmailField
      },
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );

    await getState()
      .init.contract.methods.addEscrow(escrowObj.data.user.ethereum_address)
      .send({
        from: user.ethereum_address
      });

    await axios.post(
      "/api/agreements/add-agreement",
      {
        escrowEmail: escrowEmailField,
        UPID: selectedListing.UPID,
        buyer_id: user.id
      },
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );

    dispatch({
      type: actionTypes.ADD_ESCROW_TO_AGREEMENT,
      payload: {}
    });

    getAllListings(user.token)(dispatch);
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const signAgreement = (
  { myAgreements, selectedAgreement },
  user,
  api_url,
  reqBody,
  action_type
) => async (dispatch, getState) => {
  let resultBC;

  const escrowId = selectedAgreement.escrow[0].ethereum_address;
  const coinId = selectedAgreement.property.coin_id;
  const buyerId = selectedAgreement.buyer[0].ethereum_address;
  console.debug(escrowId, coinId, buyerId, user.ethereum_address);
  try {
    resultBC = await getState()
      .init.contract.methods.signAgreement(escrowId, buyerId, coinId)
      .send({
        from: user.ethereum_address
      });

    console.debug(resultBC);
  } catch (err) {
    console.error(err);
    return err;
  }

  try {
    const result = await axios.post(`/api/agreements/${api_url}`, reqBody, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    let matchIdx = -1,
      record;

    for (let index = 0; index < myAgreements.length; index++) {
      const agreement = myAgreements[index];

      if (agreement.id === result.data.updatedAgreement.id) {
        matchIdx = index;
        record = result.data.updatedAgreement;
        break;
      }
    }

    if (matchIdx !== -1) {
      myAgreements[matchIdx] = record;
    }

    dispatch({
      type: action_type,
      payload: { myAgreements }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const makeTransfer = (
  { myAgreements, selectedAgreement },
  user,
  api_url,
  reqBody,
  action_type
) => async (dispatch, getState) => {
  let resultBC;

  const escrowId = selectedAgreement.escrow[0].ethereum_address;
  const price = selectedAgreement.property.price;
  console.debug(escrowId, user.ethereum_address, price);
  try {
    const web3Instance = await getWeb3();
    resultBC = await getState()
      .init.contract.methods.transferEth(escrowId)
      .send({
        from: user.ethereum_address,

        value: web3Instance.utils.toWei(
          // +2 is needed to make sure we don't run out of gas, after execution remaining balance will be refunded to the account
          Number(parseInt(price) + 2).toString(),
          "ether"
        )
      });

    console.debug(resultBC);
  } catch (err) {
    console.error(err);
    return err;
  }

  try {
    const result = await axios.post(`/api/agreements/${api_url}`, reqBody, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    let matchIdx = -1,
      record;

    for (let index = 0; index < myAgreements.length; index++) {
      const agreement = myAgreements[index];

      if (agreement.id === result.data.updatedAgreement.id) {
        matchIdx = index;
        record = result.data.updatedAgreement;
        break;
      }
    }

    if (matchIdx !== -1) {
      myAgreements[matchIdx] = record;
    }

    dispatch({
      type: action_type,
      payload: { myAgreements }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const transferProperty = (
  { myAgreements, selectedAgreement },
  user,
  api_url,
  reqBody,
  action_type
) => async (dispatch, getState) => {
  let resultBC;

  const buyerId = selectedAgreement.buyer[0].ethereum_address;
  const coinId = selectedAgreement.property.coin_id;
  const sellerId = selectedAgreement.seller[0].ethereum_address;
  const price = selectedAgreement.property.price;

  console.debug(buyerId, coinId, sellerId, user.ethereum_address, price);

  try {
    const web3Instance = await getWeb3();

    resultBC = await getState()
      .init.contract.methods.transferProperty(sellerId, buyerId, coinId)
      .send({
        from: user.ethereum_address,

        value: web3Instance.utils.toWei(
          // +2 is needed to make sure we don't run out of gas, after execution remaining balance will be refunded to the account
          Number(parseInt(price) + 2).toString(),
          "ether"
        )
      });

    console.debug(resultBC);
  } catch (err) {
    console.error(err);
    return err;
  }

  try {
    const result = await axios.post(`/api/agreements/${api_url}`, reqBody, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    let matchIdx = -1,
      record;

    for (let index = 0; index < myAgreements.length; index++) {
      const agreement = myAgreements[index];

      if (agreement.id === result.data.updatedAgreement.id) {
        matchIdx = index;
        record = result.data.updatedAgreement;
        break;
      }
    }

    if (matchIdx !== -1) {
      myAgreements[matchIdx] = record;
    }

    dispatch({
      type: action_type,
      payload: { myAgreements }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};

export const updateAgreements = (
  { myAgreements },
  token,
  api_url,
  reqBody,
  action_type
) => async dispatch => {
  try {
    const result = await axios.post(`/api/agreements/${api_url}`, reqBody, {
      headers: { Authorization: `Bearer ${token}` }
    });

    let matchIdx = -1,
      record;

    for (let index = 0; index < myAgreements.length; index++) {
      const agreement = myAgreements[index];

      if (agreement.id === result.data.updatedAgreement.id) {
        matchIdx = index;
        record = result.data.updatedAgreement;
        break;
      }
    }

    if (matchIdx !== -1) {
      myAgreements[matchIdx] = record;
    }

    dispatch({
      type: action_type,
      payload: { myAgreements }
    });
  } catch (err) {
    ajaxErrorHandler(err, dispatch);
  }
};
