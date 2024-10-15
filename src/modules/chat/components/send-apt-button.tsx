'use client';

import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust the import path as needed

interface SendAptButtonProps {
  toAddress: string;
  amount: string;
}

export const SendAptButton: React.FC<SendAptButtonProps> = ({ toAddress, amount }) => {
  const handleSendApt = async () => {
    // Here you would implement the logic to send APT
    // This might involve calling a wallet API or interacting with the Aptos blockchain
    console.log(`Sending ${amount} APT to ${toAddress}`);
    alert(`Transaction initiated: Sending ${amount} APT to ${toAddress}`);
    // In a real implementation, you'd want to show a loading state and handle success/error cases
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="mb-2 text-gray-400">Function</div>
      <div className="mb-4 text-white">("CoinType":"aptos")</div>
      <Button
        onClick={handleSendApt}
        className="flex w-full items-center justify-center rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
      >
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        EXECUTE TRANSACTION
      </Button>
    </div>
  );
};
