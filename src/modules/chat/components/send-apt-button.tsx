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
    <Button onClick={handleSendApt}>
      Send {amount} APT to {toAddress.substring(0, 6)}...{toAddress.substring(toAddress.length - 4)}
    </Button>
  );
};
