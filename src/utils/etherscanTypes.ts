export interface TransactionInfoArgs {
  address: string;
}

export interface BalanceInfoArgs {
  address: string;
}

export interface TransactionInfo {
  from: string;
  to: string;
  contractAddress: string;
  tokenSymbol: string;
}

export interface BalanceResp {
  result: string;
}

export interface TransactionsResp {
  result: TransactionInfo[];
}