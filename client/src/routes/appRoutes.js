import HomePage from "../Home/HomePage";
import Auth from "../Auth/Auth";

export default [
  {
    path: "/",
    component: HomePage,
    exact: true
  },
  {
    path: "/auth",
    component: Auth
  }
];
