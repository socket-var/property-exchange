import { combineReducers } from "redux";
import init from "./initReducer";
import auth from "./authReducer";
import appSnackbar from "./snackbarReducer";
import pxData from "./propertiesReducer";

export default combineReducers({ auth, init, appSnackbar, pxData });
