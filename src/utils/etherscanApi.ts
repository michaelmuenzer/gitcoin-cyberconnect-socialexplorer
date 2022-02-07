import {
    TransactionsResp,
    BalanceResp,
    TransactionInfoArgs,
    BalanceInfoArgs,
  } from './etherscanTypes';

const API_KEY_ETHERSCAN = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export const transactionListInfoQuery = async ({ address }: TransactionInfoArgs) => {
        var etherscanApi = require('etherscan-api').init(API_KEY_ETHERSCAN);
        var data = await etherscanApi.account.tokentx(address);
        return data as TransactionsResp || null;
  };

  export const balanceInfoQuery = async ({ address }: BalanceInfoArgs) => {
    var etherscanApi = require('etherscan-api').init(API_KEY_ETHERSCAN);
    var data = await etherscanApi.account.balance(address);
    return data as BalanceResp || null;
};