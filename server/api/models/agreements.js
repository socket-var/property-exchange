const { sequelize, DataTypes } = require("../../dbConfig");
const Property = require("../models/properties")(sequelize, DataTypes);
const User = require("../models/users")(sequelize, DataTypes);

module.exports = function(sequelize, DataTypes) {
  const Agreement = sequelize.define(
    "agreements",
    {
      buyer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      UPID: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "properties",
          key: "UPID"
        }
      },
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      escrow_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      seller_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      seller_signature: {
        type: DataTypes.STRING,
        allowNull: true
      },
      buyer_signature: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(
          "INIT",
          "AGREEMENT_GENERATED",
          "SIGNATURES_PENDING",
          "BUYER_SIGNATURE_PENDING",
          "SELLER_SIGNATURE_PENDING",
          "TRANSFER_TO_ESCROW_PENDING",
          "TRANSFER_FROM_ESCROW_PENDING",
          "PROPERTY_TRANSFERRED"
        ),
        allowNull: true
      }
    },
    {
      tableName: "agreements",
      timestamps: false
    }
  );

  Agreement.hasMany(User, {
    foreignKey: "id",
    sourceKey: "buyer_id",
    as: "buyer"
  });
  Agreement.hasMany(User, {
    foreignKey: "id",
    sourceKey: "escrow_id",
    as: "escrow"
  });

  Agreement.hasMany(User, {
    foreignKey: "id",
    sourceKey: "seller_id",
    as: "seller"
  });

  Agreement.hasOne(Property, {
    foreignKey: "UPID",
    sourceKey: "UPID"
  });

  return Agreement;
};
