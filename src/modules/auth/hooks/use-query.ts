import { useCallback, useState } from 'react';

import { getAptosClient } from '../utils/aptos-client';

import { useKeylessAccount } from '../context/keyless-account-context';
import { queryNFTInBalance } from '../graphql/query';

const aptosClient = getAptosClient();

export const useGetTokenInBalance = () => {
  const { keylessAccount } = useKeylessAccount();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<any>([]);
  const fetchToken = useCallback(async () => {
    if (!keylessAccount) return;
    try {
      setisLoading(true);
      const resTokens = await aptosClient.queryIndexer({
        query: {
          query: `query TokenInBalance{
                        current_fungible_asset_balances(
                            where: {owner_address: {_eq: ${keylessAccount?.accountAddress.toString()}}}
                        ) {
                            owner_address
                            amount
                            storage_id
                            last_transaction_version
                            last_transaction_timestamp
                            is_frozen
                            metadata {
                            asset_type
                            creator_address
                            decimals
                            icon_uri
                            name
                            project_uri
                            symbol
                            token_standard
                            maximum_v2
                            supply_v2
                            }
                        }
                        }`
        }
      });

      console.log(resTokens);
      setTokens(resTokens);
    } catch (err) {
      console.log('err fetch');
    }
  }, [keylessAccount]);

  return {
    fetchToken,
    tokens
  };
};

export const useGetNFTInBalance = () => {
  const { keylessAccount } = useKeylessAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [NFTs, setNFTs] = useState<any>([]);
  const fetchNFTs = useCallback(async () => {
    if (!keylessAccount) return;
    try {
      setIsLoading(true);
      const tokens = await aptosClient.queryIndexer({
        query: {
          query: queryNFTInBalance,
          variables: {
            address: keylessAccount?.accountAddress.toString()
          }
        }
      });

      console.log(tokens);
      setNFTs(tokens);
    } catch (err) {
      console.log('err fetch');
    }
  }, [keylessAccount]);

  return {
    fetchNFTs,
    NFTs
  };
};
