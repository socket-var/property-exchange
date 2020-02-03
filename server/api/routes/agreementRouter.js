const express = require("express");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();
const { sequelize, DataTypes } = require("../../dbConfig");
const { Op } = require("sequelize");
const Property = require("../models/properties")(sequelize, DataTypes);
const Agreement = require("../models/agreements")(sequelize, DataTypes);
const User = require("../models/users")(sequelize, DataTypes);
// const bcrypt = require("bcryptjs");
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

async function getMyAgreements(req, res, next) {
  // const { condition } = req.body;
  let myAgreements;
  if (req.decoded.role) {
    try {
      myAgreements = await Agreement.findAll({
        include: [
          { model: Property },
          { model: User, as: "buyer" },
          { model: User, as: "seller" },
          { model: User, as: "escrow" }
        ],
        where: {
          [Op.or]: [
            {
              buyer_id: req.decoded.id
            },
            { escrow_id: req.decoded.id },
            { seller_id: req.decoded.id }
          ]
        }
      });
      res.status(200).json({
        message: "Agreements successfully loaded",
        myAgreements
      });
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        myAgreements: []
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token.",
      myAgreements: []
    });
  }
}

async function addNewAgreement(req, res, next) {
  const { escrowEmail, UPID, buyer_id } = req.body;
  if (req.decoded.role == "CONSUMER") {
    try {
      const isPresent = await Agreement.findOne({
        where: {
          UPID
        }
      });

      if (isPresent) {
        return res.status(401).json({
          message: "Agreement already exists!!",
          newAgreement: {}
        });
      } else {
        const escrow = await User.findOne({ where: { email: escrowEmail } });
        if (escrow) {
          const property = await Property.findOne({ where: { UPID } });
          const newAgreement = await Agreement.create({
            buyer_id,
            seller_id: property.owner_id,
            UPID,
            status: "INIT",
            escrow_id: escrow.id
          });

          const agreement = await Agreement.findOne({
            include: [
              { model: Property },
              { model: User, as: "buyer" },
              { model: User, as: "seller" },
              { model: User, as: "escrow" }
            ],
            where: {
              id: newAgreement.id
            }
          });

          res.status(200).json({
            message: "Your escrow request has been successfully created",
            agreement
          });
        } else {
          return res.status(404).json({
            message: "Escrow doesn't exist",
            newAgreement: {}
          });
        }
      }
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        newAgreement: {}
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token."
    });
  }
}

async function generateAgreement(req, res, next) {
  const { agreementId } = req.body;
  if (req.decoded.role == "ESCROW") {
    try {
      const existingAgreement = await Agreement.findOne({
        where: {
          id: agreementId
        }
      });

      if (!existingAgreement) {
        return res.status(404).json({
          message: "Agreement doesn't exist",
          newAgreement: {}
        });
      } else {
        if (existingAgreement.status == "INIT") {
          existingAgreement.status = "AGREEMENT_GENERATED";

          await existingAgreement.save();

          const updatedAgreement = await Agreement.findOne({
            include: [
              { model: Property },
              { model: User, as: "buyer" },
              { model: User, as: "seller" },
              { model: User, as: "escrow" }
            ],
            where: {
              id: agreementId
            }
          });

          res.status(200).json({
            message: "Agreement is successfully generated",
            updatedAgreement
          });
        } else {
          return res.status(401).json({
            message:
              "Agreement status should be INIT to generate agreement but it is " +
              existingAgreement.status,
            newAgreement: {}
          });
        }
      }
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        newAgreement: {}
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token."
    });
  }
}

async function signAgreement(req, res, next) {
  const { agreementId } = req.body;
  if (req.decoded.role == "CONSUMER") {
    try {
      const existingAgreement = await Agreement.findOne({
        where: {
          id: agreementId
        }
      });
      if (!existingAgreement) {
        return res.status(404).json({
          message: "Agreement doesn't exist",
          newAgreement: {}
        });
      } else {
        if (
          existingAgreement.status === "AGREEMENT_GENERATED" ||
          existingAgreement.status === "BUYER_SIGNATURE_PENDING" ||
          existingAgreement.status === "SELLER_SIGNATURE_PENDING"
        ) {
          // TODO: get transaction id from eth

          // if buyer update buyer_signature
          if (req.decoded.id === existingAgreement.buyer_id) {
            existingAgreement.buyer_signature = true;
          } else if (req.decoded.id === existingAgreement.seller_id) {
            // if seller
            existingAgreement.seller_signature = true;
          }

          if (
            existingAgreement.buyer_signature &&
            existingAgreement.seller_signature
          ) {
            existingAgreement.status = "TRANSFER_TO_ESCROW_PENDING";
          } else if (existingAgreement.buyer_signature) {
            existingAgreement.status = "SELLER_SIGNATURE_PENDING";
          } else {
            existingAgreement.status = "BUYER_SIGNATURE_PENDING";
          }

          await existingAgreement.save();

          const updatedAgreement = await Agreement.findOne({
            include: [
              { model: Property },
              { model: User, as: "buyer" },
              { model: User, as: "seller" },
              { model: User, as: "escrow" }
            ],
            where: {
              id: agreementId
            }
          });

          res.status(200).json({
            message: "Agreement is successfully signed",
            updatedAgreement
          });
        } else {
          return res.status(401).json({
            message:
              "Agreement status should be AGREEMENT_GENERATED or BUYER_SIGNATURE_PENDING or SELLER_SIGNATURE_PENDING to sign the agreement but it is " +
              existingAgreement.status,
            newAgreement: {}
          });
        }
      }
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        newAgreement: {}
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token."
    });
  }
}

async function makePayment(req, res, next) {
  const { agreementId, price } = req.body;
  if (req.decoded.role == "CONSUMER") {
    try {
      const existingAgreement = await Agreement.findOne({
        where: {
          id: agreementId
        }
      });

      if (!existingAgreement) {
        return res.status(404).json({
          message: "Agreement doesn't exist",
          newAgreement: {}
        });
      } else {
        if (existingAgreement.status == "TRANSFER_TO_ESCROW_PENDING") {
          // TODO: transfer all eth to escrow

          existingAgreement.status = "TRANSFER_FROM_ESCROW_PENDING";

          await existingAgreement.save();

          const updatedAgreement = await Agreement.findOne({
            include: [
              { model: Property },
              { model: User, as: "buyer" },
              { model: User, as: "seller" },
              { model: User, as: "escrow" }
            ],
            where: {
              id: agreementId
            }
          });

          res.status(200).json({
            message: "Transfer to escrow succeeded",
            updatedAgreement
          });
        } else {
          return res.status(401).json({
            message:
              "Agreement status should be TRANSFER_TO_ESCROW_PENDING to transfer amount" +
              existingAgreement.status,
            newAgreement: {}
          });
        }
      }
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        newAgreement: {}
      });
    }
  } else if (req.decoded.role == "CONSUMER") {
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token."
    });
  }
}

async function transferProperty(req, res, next) {
  const { agreementId } = req.body;
  if (req.decoded.role == "ESCROW") {
    try {
      const existingAgreement = await Agreement.findOne({
        include: [
          { model: Property },
          { model: User, as: "buyer" },
          { model: User, as: "seller" },
          { model: User, as: "escrow" }
        ],
        where: {
          id: agreementId
        }
      });

      if (!existingAgreement) {
        return res.status(404).json({
          message: "Agreement doesn't exist",
          newAgreement: {}
        });
      } else {
        if (existingAgreement.status == "TRANSFER_FROM_ESCROW_PENDING") {
          const property = await Property.findOne({
            UPID: existingAgreement.UPID
          });
          if (property) {
            // TODO: transfer eth
            // get price of the property

            // update property's owner
            property.owner_id = existingAgreement.buyer_id;

            // update agreement status to transferred
            existingAgreement.status = "PROPERTY_TRANSFERRED";

            await property.save();

            await existingAgreement.save();

            await Agreement.findOne({
              include: [
                { model: Property },
                { model: User, as: "buyer" },
                { model: User, as: "seller" },
                { model: User, as: "escrow" }
              ],
              where: {
                id: agreementId
              }
            });

            const updatedAgreement = await Agreement.findOne({
              include: [
                { model: Property },
                { model: User, as: "buyer" },
                { model: User, as: "seller" },
                { model: User, as: "escrow" }
              ],
              where: {
                id: agreementId
              }
            });

            res.status(200).json({
              message: "Property is succesfully transferred to the buyer",
              updatedAgreement
            });
          } else {
          }
        } else {
          return res.status(401).json({
            message:
              "Agreement status should be TRANSFER_FROM_ESCROW_PENDING to transfer proeprty but it is " +
              existingAgreement.status,
            newAgreement: {}
          });
        }
      }
    } catch (err) {
      debug(err);
      return res.status(500).json({
        message: "Cannot retrieve data!! Try again!",
        newAgreement: {}
      });
    }
  } else {
    debug(req.decoded);
    return res.status(401).json({
      message: "Access denied! Invalid token."
    });
  }
}

authRouter.route("/my-agreements").get(verifyJwt, getMyAgreements);

authRouter.route("/generate-agreement").post(verifyJwt, generateAgreement);

authRouter.route("/sign-agreement").post(verifyJwt, signAgreement);

authRouter.route("/make-payment").post(verifyJwt, makePayment);

authRouter.route("/transfer-property").post(verifyJwt, transferProperty);

authRouter.route("/add-agreement").post(verifyJwt, addNewAgreement);

module.exports = authRouter;
