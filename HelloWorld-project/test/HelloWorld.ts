import { viem } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("HelloWorld", function () {
  async function deployContractFixture() {
    const publicClient = await viem.getPublicClient();
    const [owner, otherAccount] = await viem.getWalletClients();
    const helloWorldContract = await viem.deployContract("HelloWorld");
    return {
      publicClient,
      owner,
      otherAccount,
      helloWorldContract,
    };
  }

  it("Should give a Hello World", async function () {
    const { helloWorldContract } = await loadFixture(deployContractFixture);
    const helloWorldText = await helloWorldContract.read.helloWorld();
    expect(helloWorldText).to.equal("Hello World");
  });

  it("Should set owner to deployer account", async function () {
    const { helloWorldContract, owner } = await loadFixture(
      deployContractFixture
    );
    const contractOwner = await helloWorldContract.read.owner();
    expect(contractOwner.toLowerCase()).to.equal(owner.account.address);
  });

  it("Should not allow anyone other than owner to call transferOwnership", async function () {
    const { helloWorldContract, otherAccount } = await loadFixture(
      deployContractFixture
    );
    const helloWorldContractAsOtherAccount = await viem.getContractAt(
      "HelloWorld",
      helloWorldContract.address,
      { client: { wallet: otherAccount } }
    );
    await expect(
      helloWorldContractAsOtherAccount.write.transferOwnership([
        otherAccount.account.address,
      ])
    ).to.be.rejectedWith("Caller is not the owner");
  });

  it("Should execute transferOwnership correctly", async function () {
    const { publicClient, helloWorldContract, owner, otherAccount } =
      await loadFixture(deployContractFixture);
    const txHash = await helloWorldContract.write.transferOwnership([
      otherAccount.account.address,
    ]);
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.equal("success");
    const contractOwner = await helloWorldContract.read.owner();
    expect(contractOwner.toLowerCase()).to.equal(otherAccount.account.address);
    const helloWorldContractAsPreviousAccount = await viem.getContractAt(
      "HelloWorld",
      helloWorldContract.address,
      { client: { wallet: owner } }
    );
    await expect(
      helloWorldContractAsPreviousAccount.write.transferOwnership([
        owner.account.address,
      ])
    ).to.be.rejectedWith("Caller is not the owner");
  });

  it("Should not allow anyone other than owner to change text", async function () {
    const { helloWorldContract, otherAccount } = await loadFixture(
      deployContractFixture
    );
    const helloWorldContractAsOtherAccount = await viem.getContractAt(
      "HelloWorld",
      helloWorldContract.address,
      { client: {wallet: otherAccount } }
    );
    await expect(
      helloWorldContractAsOtherAccount.write.setText([
        "somethingNew"
      ])
    ).to.be.rejectedWith("Caller is not the owner");
  });

  it("Should change text correctly", async function () {
   const { helloWorldContract } = await loadFixture(
    deployContractFixture
   );
   const newText = "Something new"
   await helloWorldContract.write.setText([
    newText
   ]);
   const currentText = await helloWorldContract.read.helloWorld();
   expect(currentText).to.equal(newText);
  });
});