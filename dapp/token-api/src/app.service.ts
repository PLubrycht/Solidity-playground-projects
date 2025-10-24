import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import { Address, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import * as dotenv from 'dotenv';

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || '';
// const deployerPrivateKey = process.env.PRIVATE_KEY || '';
const tokenAddress = process.env.TOKEN_ADDRESS || '';

console.log('help', process.env.ALCHEMY_API_KEY);

console.log('providerApiKey', providerApiKey.slice(0, 5), '...');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getContractAddress(): string {
    return tokenAddress;
  }
  async getTokenName(): Promise<string> {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      ),
    });
    const name = await publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }
}
