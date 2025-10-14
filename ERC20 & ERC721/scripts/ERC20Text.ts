import { viem } from "hardhat";
import { parseEther } from "viem";

async function main() {
  const publicClient = await viem.getPublicClient();
  const [deployer, account1, account2] = await viem.getWalletClients();
  const tokenContract = await viem.deployContract("MyToken");
  console.log(`Contract deployed at ${tokenContract.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
