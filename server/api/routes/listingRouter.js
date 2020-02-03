const express = require("express");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();
const { Sequelize } = require("sequelize");
const { sequelize, DataTypes } = require("../../dbConfig");
const Property = require("../models/properties")(sequelize, DataTypes);
const User = require("../models/users")(sequelize, DataTypes);

const debug = require("debug")("property-exchange:listing");

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
async function getAllListings(req, res, next) {
  if (req.decoded.role) {
    try {
      allListings = await Property.findAll({
        include: [{ model: User, as: "owner" }],
        where: {
          is_on_sale: true,
          owner_id: { [Sequelize.Op.not]: req.decoded.id }
        }
      });

      res.status(200).json({
        message: "Properties successfully laoded",
        allListings
      });
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        allListings: []
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token.",
      allListings: []
    });
  }
}

// called when login post request
async function getMyListings(req, res, next) {
  const { condition } = req.body;
  if (req.decoded.role == "CONSUMER") {
    try {
      myListings = await Property.findAll({
        where: {
          owner_id: req.decoded.id
        }
      });

      res.status(200).json({
        message: "Your listings successfully laoded",
        myListings
      });
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        myListings: []
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token.",
      myListings: []
    });
  }
}

async function addNewListing(req, res, next) {
  const { price, address, UPID, coin_id } = req.body;
  if (req.decoded.role == "CONSUMER") {
    try {
      const isPresent = await Property.findOne({
        where: {
          UPID
        }
      });

      if (isPresent) {
        return res.status(401).json({
          message: "Property already exists!!",
          listing: {}
        });
      } else {
        const newListing = await Property.create({
          price,
          address,
          UPID,
          is_on_sale: true,
          owner_id: req.decoded.id,
          coin_id
        });
        res.status(200).json({
          message: "Your listing has been successfully created",
          newListing
        });
      }
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        newListing: {}
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token."
    });
  }
}

authRouter.route("/all-listings").get(verifyJwt, getAllListings);

authRouter.route("/my-listings").get(verifyJwt, getMyListings);

authRouter.route("/new-listing").post(verifyJwt, addNewListing);

module.exports = authRouter;
