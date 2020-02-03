const express = require("express");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();
const { sequelize, DataTypes } = require("../../dbConfig");
const User = require("../models/users")(sequelize, DataTypes);
const bcrypt = require("bcryptjs");
const debug = require("debug")("property-exchange:auth");

function generateJwt(user) {
  const payload = {
    id: user.id,
    email: user.email,
    ethereum_address: user.ethereum_address,
    role: user.user_type
  };
  const options = {
    expiresIn: "2d",
    issuer: "property-exchange"
  };
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, options);
  return { token, ...payload };
}

async function verifyJwt(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Access denied! Unauthorized operation."
    });
  } else {
    const token = req.headers.authorization.split(" ")[1];
    const options = {
      expiresIn: "2d",
      issuer: "property-exchange"
    };
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, options);

      req.decoded = decoded;
      next();
    } catch (err) {
      debug(err);
      return res.status(401).json({
        message: "Access denied! Invalid token."
      });
    }
  }
}

// called when signup post request is made
async function signupFunction(req, res, next) {
  const { email, password, user_type, ethereum_address } = req.body;
  let newUser;

  try {
    newUser = await User.create({
      email,
      password,
      user_type,
      ethereum_address
    });

    const result = generateJwt(newUser);

    res.status(200).json({
      message: "Signup success!!",
      user: result
    });
  } catch (err) {
    debug(err);
    return res.status(500).json({
      message: "Account registration failed. Try again!",
      user: {}
    });
  }
}

// called when login post request
async function loginFunction(req, res, next) {
  const { email, password } = req.body;

  let user;

  try {
    user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "User not registered! Please signup.",
        user: {}
      });
    }

    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      return res.status(401).json({
        message: "Email or password is incorrect!!",
        user: {}
      });
    }

    const returnVal = generateJwt(user);

    return res.status(200).json({
      message: "Login Success!",
      user: returnVal
    });
  } catch (err) {
    debug(err);
    return res.status(401).json({
      message: "Login failed! Try again!",
      user: {}
    });
  }
}

async function lookupEscrow(req, res, next) {
  const { escrowEmail } = req.body;

  try {
    const user = await User.findOne({
      where: { email: escrowEmail, user_type: "ESCROW" }
    });

    res.status(200).json({
      message: "Lookup success",
      user
    });
  } catch (err) {
    debug(err);
    return res.status(401).json({
      message: "Login failed! Try again!",
      user: {}
    });
  }
}

authRouter.route("/signup").post(signupFunction);

authRouter.route("/login").post(loginFunction);

authRouter.route("/lookup-escrow").post(verifyJwt, lookupEscrow);

module.exports = authRouter;
