const { sequelize, DataTypes } = require("../../dbConfig");
const User = require("../models/users")(sequelize, DataTypes);

module.exports = function(sequelize, DataTypes) {
  const Property = sequelize.define(
    "properties",
    {
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      is_on_sale: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      owner_id: {
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
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      coin_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    },
    {
      tableName: "properties",
      timestamps: false
    }
  );

  Property.hasOne(User, {
    foreignKey: "id",
    sourceKey: "owner_id",
    as: "owner"
  });
  return Property;
};
