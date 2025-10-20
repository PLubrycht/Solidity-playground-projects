import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { formatEther, parseEther } from "viem";
const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const RATIO = 10n;
const PRICE = 5n;
const TEST_BUY_TOKENS = parseEther("1");

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

  const grantMinterRolePaymentTokenContractTx =
    await paymentTokenContract.write.grantRole([
      MINTER_ROLE,
      tokenSaleContract.address,
    ]);

  await publicClient.waitForTransactionReceipt({
    hash: grantMinterRolePaymentTokenContractTx,
  });

  return {
    publicClient,
    deployer,
    otherAccount,
    tokenSaleContract,
    paymentTokenContract,
    nftContract,
  };
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
      expect(totalSupply).to.eq(0);
      await expect(tokenContract.read.name()).not.to.be.rejected;
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      const {
        publicClient,
        tokenSaleContract,
        otherAccount,
        paymentTokenContract,
      } = await loadFixture(deployContract);
      const ethBalanceBeforeBuyTx = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      const tx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS,
        account: otherAccount.account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      const ethBalanceAfterBuyTx = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      const gasAmount = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const gasCost = gasAmount * gasPrice;
      const diff = ethBalanceBeforeBuyTx - ethBalanceAfterBuyTx - gasCost;
      expect(diff).to.eq(TEST_BUY_TOKENS);
    });
    it("gives the correct amount of tokens", async () => {
      const {
        publicClient,
        tokenSaleContract,
        otherAccount,
        paymentTokenContract,
      } = await loadFixture(deployContract);
      const tokenBalanceBeforeBuyTx = await paymentTokenContract.read.balanceOf(
        [otherAccount.account.address]
      );
      const tx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS,
        account: otherAccount.account,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      const tokenBalanceAfterBuyTx = await paymentTokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);
      const diff = tokenBalanceAfterBuyTx - tokenBalanceBeforeBuyTx;
      expect(diff).to.eq(TEST_BUY_TOKENS * RATIO);
    });
  });
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("burns the correct amount of tokens", async () => {
      const {
        publicClient,
        tokenSaleContract,
        otherAccount,
        paymentTokenContract,
      } = await loadFixture(deployContract);

      const tx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS,
        account: otherAccount.account,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      const tokenBalanceAfterBuyTx = await paymentTokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);
      const approveTx = await paymentTokenContract.write.approve(
        [tokenSaleContract.address, tokenBalanceAfterBuyTx],
        {
          account: otherAccount.account,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      const tx2 = await tokenSaleContract.write.burnTokens(
        [tokenBalanceAfterBuyTx],
        {
          account: otherAccount.account,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: tx2 });
      const tokenBalanceAfterBurnTx = await paymentTokenContract.read.balanceOf(
        [otherAccount.account.address]
      );
      expect(tokenBalanceAfterBurnTx).to.eq(0n);
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
