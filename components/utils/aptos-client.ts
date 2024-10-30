import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { AptosClient } from 'aptos';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

export function getAptosClient() {
  const config = new AptosConfig({ network: Network.TESTNET });

  return new Aptos(config);
}

export async function getAptosBalance(address: string): Promise<string> {
  try {
    const resources = await client.getAccountResources(address);
    const accountResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
    if (accountResource) {
      const balance = (accountResource.data as { coin: { value: string } }).coin.value;
      return (parseInt(balance) / 100000000).toString(); // Convert from octas to APT
    }
    return '0';
  } catch (error) {
    
    return '0';
  }
}
