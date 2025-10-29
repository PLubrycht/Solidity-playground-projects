import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import {
  Address,
  createPublicClient,
  formatEther,
  http,
  type PublicClient,
} from 'viem';
import { sepolia } from 'viem/chains';
import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import * as dotenv from 'dotenv';

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || '';
// const deployerPrivateKey = process.env.PRIVATE_KEY || '';
const tokenAddress = process.env.TOKEN_ADDRESS || '';

console.log('help', process.env.ALCHEMY_API_KEY);

console.log('providerApiKey', providerApiKey.slice(0, 5), '...');

@Injectable()
export class AppService {
  mintTokens(address: any) {
    throw new Error('Method not implemented.');
  }
  private readonly publicClient: PublicClient;
  private readonly walletClient: ReturnType<typeof createWalletClient>;

  constructor() {
    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    this.walletClient = createWalletClient({
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
      chain: sepolia,
      account: account,
    });
  }
  getHello(): string {
    return 'Hello World!';
  }
  getContractAddress(): string {
    return tokenAddress;
  }
  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }
  async getTotalSupply() {
    const totalSupplyBN = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });
    const totalSupply = formatEther(totalSupplyBN as bigint);
    return totalSupply;
  }
  async getTokenBalance(address: string) {
    const balance = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address as Address],
    });
    const balanceFormatted = formatEther(balance as bigint);
    return balanceFormatted;
  }
  async getTransactionReceipt(hash: string) {
    await Promise.resolve();
    const receipt = await this.publicClient.getTransactionReceipt({
      hash: hash as Address,
    });
    return receipt;
  }

  getServerWalletAddress(): string {
    return this.walletClient.account?.address ?? '';
  }

  async checkMinterRole(address: string): Promise<boolean> {
    const MINTER_ROLE =
      '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
    // const MINTER_ROLE =  await this.publicClient.readContract({
    //   address: this.getContractAddress(),
    //   abi: tokenJson.abi,
    //   functionName: 'MINTER_ROLE'
    // });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole as boolean;
  }

  mintTokens(address: any) {
    return {
      success: true,
      message: 'Tokens minted successfully',
      address: address,
      hash: '0x-example-hash',
    };
  }
}
