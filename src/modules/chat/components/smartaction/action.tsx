'use client'

import { getAptosClient } from '@/modules/chat/utils/aptos-client';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Account } from '@aptos-labs/ts-sdk';
import ProfileBtnFrame from '@/assets/svgs/profile-btn-frame.svg';
export const SmartAction = ({ props: data }: { props: any }) => {
  const { account } = useWallet();
  console.log(data);
  const onTransfer = async () => {
    const aptosClient = getAptosClient();

    try {

      const txn = await aptosClient.transaction.build.simple({
        sender: account?.address.toString() as any,
        data: data
      });
      console.log(txn);
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
          Function :
        </span>
        <p>
          {JSON.stringify(data)}
        </p>

        <div
          onClick={onTransfer}
          style={{ borderImageSource: `url("${ProfileBtnFrame.src}")` }}
          className='px-11 py-1 w-full md:w-auto uppercase [border-image-slice:13_fill] [border-image-width:15px] flex items-center gap-1 justify-center cursor-pointer '>
          <i className="ico-send-right-icon" /> Excute
        </div>
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
