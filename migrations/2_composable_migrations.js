const composable = artifacts.require("ComposableNFT.sol");
const erc20 = artifacts.require("Erc20.sol");

module.exports = function (deployer) {
  deployer.deploy(composable);
  deployer.deploy(erc20, "MyERC20", "MYE");
};
