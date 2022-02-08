import {
  FollowListInfoArgs,
  SearchUserInfoArgs,
  FollowListInfoResp,
  SearchUserInfoResp,
  RecommendationListInfoArgs,
  RecommendationListInfoResp,
} from './cyberconnectTypes';

const endPoint = 'https://api.cybertino.io/connect/';

export const followListInfoSchema = ({
  address,
  namespace,
  network,
  followingFirst,
  followingAfter,
  followerFirst,
  followerAfter,
}: FollowListInfoArgs) => {
  return {
    operationName: 'followListInfo',
    query: `query followListInfo($address: String!, $namespace: String, $network: Network, $followingFirst: Int, $followingAfter: String, $followerFirst: Int, $followerAfter: String) {
      identity(address: $address, network: $network) {
        followingCount(namespace: $namespace)
        followerCount(namespace: $namespace)
        followings(namespace: $namespace, first: $followingFirst, after: $followingAfter) {
          pageInfo {
            endCursor
            hasNextPage
          }
          list {
            address
            ens
            avatar
          }
        }
        followers(namespace: $namespace, first: $followerFirst, after: $followerAfter) {
          pageInfo {
            endCursor
            hasNextPage
          }
          list {
            address
            ens
            avatar
          }
        }
      }
    }`,
    variables: {
      address,
      namespace,
      network,
      followingFirst,
      followingAfter,
      followerFirst,
      followerAfter,
    },
  };
};

export const searchUserInfoSchema = ({
  fromAddr,
  toAddr,
  namespace,
  network,
}: SearchUserInfoArgs) => {
  return {
    operationName: 'searchUserInfo',
    query: `query searchUserInfo($fromAddr: String!, $toAddr: String!, $namespace: String, $network: Network) {
      identity(address: $toAddr, network: $network) {
        address
        ens
        avatar
      }
      followStatus(fromAddr: $fromAddr, toAddr: $toAddr, namespace: $namespace, network: $network) {
        isFollowed
        isFollowing
      }
    }`,
    variables: {
      fromAddr,
      toAddr,
      namespace,
      network,
    },
  };
};

export const recommendationListInfoSchema = ({
  address,
  network,
}: RecommendationListInfoArgs) => {
  return {
    operationName: 'recommendationListInfo',
    query: `query recommendationListInfo($address: String!, $network: Network) {
      recommendations(address: $address, network: $network) {
        data {
          list {
            address
            recommendationReason
            ens
            avatar
          }
        }
      }
    }`,
    variables: {
      address,
      network,
    },
  };
};

export const querySchemas = {
  followListInfo: followListInfoSchema,
  searchUserInfo: searchUserInfoSchema,
  recommendationListInfo: recommendationListInfoSchema,
};

export const request = async (url = '', data = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });

  return response.json();
};

export const handleQuery = (
  data: {
    query: string;
    variables: object;
    operationName: string;
  },
  url: string
) => {
  return request(url, data);
};

export const followListInfoQuery = async ({
  address,
  namespace,
  network,
  followingFirst,
  followingAfter,
  followerFirst,
  followerAfter,
}: FollowListInfoArgs) => {
  const schema = querySchemas['followListInfo']({
    address,
    namespace,
    network,
    followingFirst,
    followingAfter,
    followerFirst,
    followerAfter,
  });
  const resp = await handleQuery(schema, endPoint);

  return (resp?.data?.identity as FollowListInfoResp) || null;
};

export const recommendationListInfoQuery = async ({
  address,
  network,
}: RecommendationListInfoArgs) => {
  const schema = querySchemas['recommendationListInfo']({
    address,
    network,
  });
  const resp = await handleQuery(schema, endPoint);

  return (resp?.data?.recommendations?.data as RecommendationListInfoResp) || null;
};

export const searchUserInfoQuery = async ({
  fromAddr,
  toAddr,
  namespace,
  network,
}: SearchUserInfoArgs) => {
  const schema = querySchemas['searchUserInfo']({
    fromAddr,
    toAddr,
    namespace,
    network,
  });
  const resp = await handleQuery(schema, endPoint);

  return (resp?.data as SearchUserInfoResp) || null;
};
