import type { NextPage } from 'next';
import styles from './index.module.css';
import { WalletConnectButton, SigmaGraph } from '@/components';
import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';

import { followListInfoQuery, searchUserInfoQuery, recommendationListInfoQuery } from '@/utils/cyberconnectApi';
import { FollowListInfoResp, SearchUserInfoResp, RecommendationListInfoResp, Network } from '@/utils/cyberconnectTypes';

import { transactionListInfoQuery, balanceInfoQuery } from '@/utils/etherscanApi';
import { TransactionsResp, BalanceResp } from '@/utils/etherscanTypes';

import { isValidAddr } from '@/utils/helper';
import { useWeb3 } from '@/context/web3Context';

const NAME_SPACE = 'CyberConnect';
const NETWORK = Network.ETH;
const FIRST = 20; // The number of users in followings/followers graph
//TODO: Do sub-sequent fetches automatically until all followings & followers are fetched

const Home: NextPage = () => {
  const { address, cyberConnect } = useWeb3();

  const [searchInput, setSearchInput] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const [searchAddrInfo, setSearchAddrInfo] =
    useState<SearchUserInfoResp | null>(null);

  const [balanceInfo, setBalanceInfo] =
    useState<BalanceResp | null>(null);

  const [followListInfo, setFollowListInfo] =
    useState<FollowListInfoResp | null>(null);

  const [recommendationListInfo, setRecommendationListInfo] =
    useState<RecommendationListInfoResp | null>(null);

  const [transactionListInfo, setTransactionListInfo] =
  useState<TransactionsResp | null>(null);

  const fetchSearchAddrInfo = async (toAddr: string) => {
    const resp = await searchUserInfoQuery({
      fromAddr: address,
      toAddr,
      namespace: NAME_SPACE,
      network: NETWORK,
    });

    if (resp) {
      setSearchAddrInfo(resp);
    }
  };

  const fetchSearchFollowListInfo = async () => {
    if (!searchAddrInfo) {
      return;
    }

    const resp = await followListInfoQuery({
      address: searchAddrInfo.identity.address,
      namespace: NAME_SPACE,
      network: NETWORK,
      followerFirst: FIRST,
      followingFirst: FIRST,
    });
    if (resp) {
      setFollowListInfo(resp);
    }
  };

  const fetchSearchRecommendationListInfo = async () => {
    if (!searchAddrInfo) {
      return;
    }

    const resp = await recommendationListInfoQuery({
      address: searchAddrInfo.identity.address,
      network: NETWORK,
    });
    if (resp) {
      setRecommendationListInfo(resp);
    }
  };

  const fetchTransactionsListInfo = async () => {
    if (!searchAddrInfo || NETWORK != Network.ETH) {
      return;
    }

    const resp = await transactionListInfoQuery({
      address: searchAddrInfo.identity.address,
    });
    if (resp) {
      setTransactionListInfo(resp);
    }
  };

  const fetchBalanceInfo = async () => {
    if (!searchAddrInfo || NETWORK != Network.ETH) {
      return;
    }

    const resp = await balanceInfoQuery({
      address: searchAddrInfo.identity.address,
    });
    if (resp) {
      setBalanceInfo(resp);
    }
  };

  function resetGraphRelatedInfo() {
    setRecommendationListInfo(null);
    setTransactionListInfo(null);
    setFollowListInfo(null)
  };

  const handleSearch = async () => {
    if (!cyberConnect || !searchAddrInfo) {
      return;
    }

    try {
      setSearchLoading(true);
      await fetchSearchFollowListInfo();
      await fetchBalanceInfo();
      await fetchSearchRecommendationListInfo();
      await fetchTransactionsListInfo();
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  // InputChange fetches basic information about the address
  const handleInputChange = async (value: string) => {
    setSearchInput(value);

    if (isValidAddr(value) && address) {
      setSearchLoading(true);
      resetGraphRelatedInfo()
      await fetchSearchAddrInfo(value);
    }
    setSearchLoading(false);
    //TODO: Error: Sigma: container has no width. Can this be fixed?
    //TODO: GH Actions pipeline for Netifly
    //TODO: Beautify README
  };

  return (
    <div className={styles.container}>
      <WalletConnectButton />
      {address && (
        <div className={styles.searchSection}>
          <div className={styles.inputContainer}>
            <TextField
              onChange={(e) => handleInputChange(e.target.value)}
              className={styles.textField}
              placeholder="Please input the Address you want to find."
            />
            <LoadingButton
              onClick={handleSearch}
              disabled={
                searchLoading ||
                !isValidAddr(searchInput) ||
                !address ||
                address === searchInput
              }
              loading={searchLoading}
              className={styles.loadingButton}
            >
              Search
            </LoadingButton>
          </div>
          {!isValidAddr(searchInput) ? (
            <div className={styles.error}>Please enter a valid address.</div>
          ) : address === searchInput ? (
            <div className={styles.error}>You can’t follow yourself : )</div>
          ) : (
            <div />
          )}
        </div>
      )}
      {followListInfo && balanceInfo && (
          <div>
            <div className={styles.subtitle}>
              Balance: <strong>{balanceInfo.result}</strong> Wei<br /><br />
              <strong>{followListInfo.followerCount}</strong>{' '}
              followers and <strong>{followListInfo.followingCount}</strong>{' '} followings on CyberConnect<br />
              <span className="legend">
                <span className="dot recommendation" ></span>&nbsp;Recommendation&nbsp;&nbsp;
                <span className="dot transaction" ></span>&nbsp;Transaction&nbsp;&nbsp;
                <span className="dot follow" ></span>&nbsp;Follow&nbsp;&nbsp;
              </span>
            </div>
          <SigmaGraph searchAddress={searchAddrInfo} recommendationList={recommendationListInfo} followList={followListInfo} transactionList={transactionListInfo} />
        </div>
      )}
    </div>
  );
};

export default Home;

