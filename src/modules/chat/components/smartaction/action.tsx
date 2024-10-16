'use client'

import { getAptosClient } from '@/modules/chat/utils/aptos-client';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Account } from '@aptos-labs/ts-sdk';
import CustomButton from '@/libs/svg-icons/input/custom-button';

export const SmartAction = ({ props: params }: { props: any }) => {
  const { account } = useWallet();
  const onTransfer = async () => {
    const aptosClient = getAptosClient();
    try {

      const txn = await aptosClient.transaction.build.simple({
        sender: account?.address.toString() as any,
        data: params
      });
      console.log('\n=== Transfer transaction ===\n');
      const committedTxn = await aptosClient.signAndSubmitTransaction({
        signer: account as unknown as Account,
        transaction: txn
      });
      await aptosClient.waitForTransaction({ transactionHash: committedTxn.hash });
      console.log(`Committed transaction: ${committedTxn.hash}`);
    } catch (err) {
      console.error('Error', err);
    }
  };
  return (

    <>
      <div className="flex flex-col gap-3 px-4 py-3">
        <span>
          Function
        </span>
        <p>
          {JSON.stringify(params)}
        </p>
        <CustomButton className="w-full md:w-auto" onClick={onTransfer}>
          <i className="ico-send-right-icon" /> Excute Transaction
        </CustomButton>
      </div>
    </>

  )
}
export const SmartView = ({ props: text }: { props: any }) => {

  return (

    <>
      <div className="flex flex-col gap-3 px-4 py-3">
        {text}
      </div>
    </>

  )
}
