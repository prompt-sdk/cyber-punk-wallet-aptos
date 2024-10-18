import axios from 'axios';

export const loadBalance = async (address: string) => {
  try {
    const response = await axios.get(`https://testnet.aptos.dev/v1/accounts/${address}/resources`);
    const accountResources = response.data;
    const balanceResource = accountResources.find(
      (resource: any) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    );
    if (balanceResource) {
      return balanceResource.data.coin.value;
    } else {
      throw new Error('Balance resource not found');
    }
  } catch (error) {
    console.error('Error loading balance:', error);
    throw error;
  }
};
