import { AptosClient } from 'aptos';
import axios from 'axios';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

export async function getAptosBalance(address: string): Promise<string> {
  try {
    const resources = await client.getAccountResources(address);
    const accountResource = resources.find(
      (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );
    if (accountResource) {
      const balance = (accountResource.data as { coin: { value: string } }).coin.value;
      return (parseInt(balance) / 100000000).toString(); // Convert from octas to APT
    }
    return '0';
  } catch (error) {
    console.error('Error fetching APT balance:', error);
    return '0';
  }
}

export async function getTransactionCount(address: string): Promise<number> {
  try {
    const response = await axios.get(`https://api.testnet.aptoslabs.com/v1/accounts/${address}/transactions`);
    const transactions = response.data;
    return transactions.length;
  } catch (error) {
    console.error('Error fetching transaction count:', error);
    throw error;
  }
}
