'use client';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Account } from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import { getAptosClient } from '@/modules/chat/utils/aptos-client';

import ProfileBtnFrame from '@/assets/svgs/profile-btn-frame.svg';
import react from '@mocks/next-auth/react';
import React from 'react';

export const SmartAction = ({ props: data }: { props: any }) => {
  const { account } = useWallet();

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
      <div className="flex flex-col gap-3 px-4 py-3 text-white">
        <span>Function : {data.function}</span>
        <p>
          {JSON.stringify(
            data,
            (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
          )}
        </p>

        <div
          style={{ borderImageSource: `url("${ProfileBtnFrame.src}")` }}
          className="flex w-full cursor-pointer items-center justify-center gap-1 px-11 py-1 uppercase [border-image-slice:13_fill] [border-image-width:15px] md:w-auto "
          onClick={onTransfer}
        >
          <i className="ico-send-right-icon" /> Excute
        </div>
      </div>
    </>
  );
};
export const SmartView = async ({ props: text }: { props: any }) => {
  // const aptosClient = getAptosClient();

  // React.useEffect(() => {
  //   loadData()
  // }, [])
  // const loadData = async () => {
  //   console.log("data", data)
  //   const res = await aptosClient.view({ payload: data });
  //   console.log(res);
  // }

  // // const { text } = await generateText({
  // //   model: openai('gpt-4o'),
  // //   system: `This function retrieves the balance of a specified owner for a given CoinType, including any paired fungible asset balance if it exists. It sums the balance of the coin and the balance of the fungible asset, providing a comprehensive view of the owner's total holdings`,
  // //   prompt: '0.4'
  // // });

  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-3">{text}</div>
    </>
  );
};
