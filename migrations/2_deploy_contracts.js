const PX = artifacts.require("PropertyExchange");

module.exports = function(deployer, network) {
  if (network === "rinkeby") {
    /* if deployed on rinkeby */
    deployer.deploy(PX, {
      from: "0xb670A614bb114223fA517614140F83b15897E87c"
    });
  } else {
    /* if deployed on ganache */
    deployer.deploy(PX, {
      from: "0xb670A614bb114223fA517614140F83b15897E87c"
    });
  }
};
