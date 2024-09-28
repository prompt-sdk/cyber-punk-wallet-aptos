import CustomButton from '@/libs/svg-icons/input/custom-button';
import { useKeylessAccount } from '@/modules/auth/context/keyless-account-context';
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { getAptosClient } from '../utils/aptos-client';

const ChatSend = ({ address, amount }: { address: string; amount: string }) => {
  const { keylessAccount } = useKeylessAccount();
  console.log('🚀 ~ ChatSend ~ Account:', keylessAccount?.accountAddress.toString());
  const [balance, setBalance] = useState<number>(0);
  const sliceAddress = (address: string): string => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  const displayAddress = sliceAddress(address);

  useEffect(() => {
    if (keylessAccount?.accountAddress) {
      loadBalance();
    }
  }, [keylessAccount]);

  const loadBalance = useCallback(async () => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const respo = await axios.get(
      `https://aptos-testnet.nodit.io/${
        process.env.NEXT_PUBLIC_API_KEY_NODIT
      }/v1/accounts/${keylessAccount?.accountAddress.toString()}/resources`,
      options
    );
    const datas = respo?.data[1];
    const balance = datas?.data?.coin.value;
    const formatBalance = parseFloat(balance ? balance : 0) * Math.pow(10, -8);
    setBalance(formatBalance);
  }, [keylessAccount]);

  const onTransfer = async () => {
    if (!keylessAccount) return console.log('No account');
    if (parseFloat(amount as string) > balance) return console.log('Insufficient balance');
    const aptosClient = getAptosClient();
    try {
      //   const transaction = await aptosClient.transferCoinTransaction({
      //     sender: keylessAccount?.accountAddress.toString(),
      //     recipient: address!,
      //     amount: BigInt(Number(amount) * Math.pow(10, 8))
      //   });
      const APTOS_COIN = '0x1::aptos_coin::AptosCoin';
      const txn = await aptosClient.transaction.build.simple({
        sender: keylessAccount?.accountAddress.toString(),
        data: {
          function: '0x1::coin::transfer',
          typeArguments: [APTOS_COIN],
          functionArguments: [address, Math.floor(Number(amount) * Math.pow(10, 8))]
        }
      });
      console.log('\n=== Transfer transaction ===\n');
      const committedTxn = await aptosClient.signAndSubmitTransaction({ signer: keylessAccount, transaction: txn });
      await aptosClient.waitForTransaction({ transactionHash: committedTxn.hash });
      console.log(`Committed transaction: ${committedTxn.hash}`);
    } catch (err) {
      console.error('Error', err);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <span>
        Transfer {amount} APT to {displayAddress}
      </span>
      <CustomButton className="w-full md:w-auto" onClick={onTransfer}>
        <i className="ico-send-right-icon" /> Send
      </CustomButton>
    </div>
  );
};

export default ChatSend;
