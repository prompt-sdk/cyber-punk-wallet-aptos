'use client';
import { useState, useEffect } from 'react';
import StringToReactComponent from 'string-to-react-component';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { ErrorBoundary } from 'react-error-boundary';

export const ViewFrame = ({ code }: { code: string }) => {
  const config = new AptosConfig({ network: Network.MAINNET });
  const aptos = new Aptos(config);

  const processData = (data: any) => {
    if (Array.isArray(data)) {
      return data.map(item => <p>{item}</p>);
    } else {
      const getLastChildValue = (obj: any) => {
        const keys = Object.keys(obj);
        const lastKey = keys[keys.length - 1];
        const value = obj[lastKey];

        if (typeof value === 'object') {
          return getLastChildValue(value);
        } else {
          return value;
        }
      };
      return getLastChildValue(data);
    }
  };

  return (
    <>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <StringToReactComponent data={{ useEffect, useState, aptos, processData }}>{`${code}`}</StringToReactComponent>
      </ErrorBoundary>
    </>
  );
};
