const { expect } = require("chai");
const Composable = artifacts.require("../contracts/ComposableNFT.sol");
const erc20 = artifacts.require("../contracts/ERC20.sol");

contract("ComposableNFT", (accounts) => {
  let deployer;
  let minterA;
  let minterB;
  let minter3;
  let myERC20;
  let myComposableNFT;

  beforeEach(async () => {
    [deployer, minterA, minterB, minter3] = accounts;
    myComposableNFT = await Composable.deployed();
    myERC20 = await erc20.deployed();
  });

  describe("mint ERC721 and ERC20 tokens", async () => {
    it("should mint ERC20 token for minter A", async () => {
      await myERC20.mint(minterA, 100, { from: minterA });
    });

    it("should mint ERC721 token, Composable 0 for minter A", async () => {
      await myComposableNFT.mint(minterA, { from: minterA });
    });
  });

  describe("transfer ERC20 token to a Composable contract ", async () => {
    // it("should fail when minterA tries to get erc20 from minterB", async () => {
    //     await expect(
    //         await myComposableNFT.getERC20(minterB, 0, myERC20.address, 10, {from: minterA}),
    //     ).to.equal("Not allowed to getERC20");
    // });

    it("should successfully transfer ERC20 token from minterA to Composable 0", async () => {
      await myERC20.approve(myComposableNFT.address, 100, { from: minterA });
      await myComposableNFT.getERC20(minterA, 0, myERC20.address, 10, {
        from: minterA,
      });
      const bal = await myComposableNFT.balanceOfERC20(0, myERC20.address);
      expect(bal.toNumber()).to.equal(10);
    });
  });

  describe("transfer ERC20 from Composable contract", async () => {
    // it("should fail when minterB tries to transfer minterA's erc20 token", async () => {
    //     await expect(
    //         myComposableNFT.transferERC20(0, minterB, myERC20.address, 5, {from: minterB})
    //     ).to.equal("ERC721 transfer caller is not owner nor approved");
    // });

    it("should successfully transfer half of ERC20 Composable 0 to minterB", async () => {
      //await myERC20.connect(minterB).approve(myComposableNFT.address, MAX_UINT_256);
      await myComposableNFT.transferERC20(0, minterB, myERC20.address, 5, {
        from: minterA,
      });
      const bal1 = await myERC20.balanceOf(minterB);
      expect(bal1.toNumber()).to.equal(5);
      const bal2 = await myComposableNFT.balanceOfERC20(0, myERC20.address);
      expect(bal2.toNumber()).to.equal(5);
    });
  });
});
