import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const RATIO = 10n;
const PRICE = 5n;

async function deployContract() {
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount] = await viem.getWalletClients();
  const paymentTokenContract = await viem.deployContract("MyToken");
  const nftContract = await viem.deployContract("MyNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [
    RATIO,
    PRICE,
    paymentTokenContract.address,
    nftContract.address,
  ]);
  return { publicClient, deployer, otherAccount, tokenSaleContract };
}

describe("NFT Shop", async () => {
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContract);
      const ratio = await tokenSaleContract.read.ratio();
      expect(ratio).to.eq(RATIO);
    });
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContract);
      const price = await tokenSaleContract.read.price();
      expect(price).to.eq(PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const { tokenSaleContract } = await loadFixture(deployContract);
      const tokenContractAddress = await tokenSaleContract.read.tokenContract();
      const tokenContract = await viem.getContractAt(
        "MyToken",
        tokenContractAddress
      );
      const totalSupply = await tokenContract.read.totalSupply();
      expect(totalSupply).to.gte(0);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("gives the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("burns the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});
