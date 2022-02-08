export interface GraphData {
  nodes: {
    id: string;
    ens: string;
    avatar: string;
    type: NodeAddressType;
    name: string
  }[];
  edges: {
    from: string;
    to: string;
    types: EdgeType[];
    recommendationReason: string;
  }[];
}

export enum EdgeType {
  FOLLOWER = 'Follower',
  FOLLOWING = 'Following',
  RECOMMENDATION = 'Recommendation',
  TRANSACTION = 'Transaction',
}

export enum NodeAddressType {
  SELF = 'Your Address',
  SEARCH = 'Search Address',
  PEER = 'Peer Address',
  EXCHANGE = 'Exchange',
}