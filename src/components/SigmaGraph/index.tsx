import dynamic from 'next/dynamic'
import React, { FC } from "react";

import "react-sigma-v2/lib/react-sigma-v2.css";
import { EdgeType, NodeAddressType, GraphData } from '@/utils/graphTypes';

const knownEthAddresses : Map<string, string> = require('./known_eth_exchange_addresses.json');

import { SearchUserInfoResp, FollowListInfoResp, RecommendationListInfoResp } from '@/utils/cyberconnectTypes';
import { TransactionsResp } from '@/utils/etherscanTypes';

interface SigmaGraphProps {
    searchAddress?: SearchUserInfoResp
    followList?: FollowListInfoResp;
    recommendationList?: RecommendationListInfoResp;
    transactionList?: TransactionsResp;
}

export const SigmaGraph: FC<SigmaGraphProps> = ({ searchAddress, followList, recommendationList, transactionList }) => {
    var data = {
        "nodes": [],
        "edges": []
    }

    if(searchAddress) {
        addSearchAddressToGraph(data, searchAddress);
        addFollowListToGraph(data, searchAddress, followList);
        addRecommendationListToGraph(data, searchAddress, recommendationList);
        addTransactionListToGraph(data, searchAddress, transactionList);
    }
      
    const isBrowser = () => typeof window !== "undefined"
    if(isBrowser()) {
        const SigmaContainer = dynamic(() => import("react-sigma-v2").then(mod => mod.SigmaContainer) as Promise<React.FC<any>>, {ssr: false});
        const ControlsContainer = dynamic(() => import("react-sigma-v2").then(mod => mod.ControlsContainer) as Promise<React.FC<any>>, {ssr: false});
        const ZoomControl = dynamic(() => import("react-sigma-v2").then(mod => mod.ZoomControl) as Promise<React.FC<any>>, {ssr: false});
        const MyGraph = dynamic(() => import('../MyGraph').then(mod => mod.MyGraph) as Promise<React.FC<any>>, {ssr: false});

        return (
            <SigmaContainer style={{ height: "600px", width: "1500px" }}>
                <MyGraph data = { data } />
                <ControlsContainer position={"bottom-right"}>
                    <ZoomControl />
                </ControlsContainer>
            </SigmaContainer>
        )
    }
    else return (<p>NOT AVAILABLE</p>)
};

function addFollowListToGraph(data: GraphData, searchAddress: SearchUserInfoResp, followList?: FollowListInfoResp) {
    followList?.followers.list.forEach(follower => {
        addNodeToGraph(data, follower.address, follower.ens, follower.avatar, NodeAddressType.PEER, "");

        addEdgeToGraph(data, follower.address, searchAddress.identity.address, EdgeType.FOLLOWER, "");
    })
    
    followList?.followings.list.forEach(following => {
        addNodeToGraph(data, following.address, following.ens, following.avatar, NodeAddressType.PEER, "");        

        addEdgeToGraph(data, searchAddress.identity.address, following.address, EdgeType.FOLLOWING, "");
    })
}

function addRecommendationListToGraph(data: GraphData, searchAddress: SearchUserInfoResp, recommendationList?: RecommendationListInfoResp) {
    recommendationList?.list.forEach(recommendation => {
        addNodeToGraph(data, recommendation.address, recommendation.ens, recommendation.avatar, NodeAddressType.PEER, "");        

        addEdgeToGraph(data, searchAddress.identity.address, recommendation.address, EdgeType.RECOMMENDATION, recommendation.recommendationReason);
    })
}

function addTransactionListToGraph(data: GraphData, searchAddress?: SearchUserInfoResp, transactionList?: TransactionsResp) {
    const searchAddressString = searchAddress?.identity.address
    transactionList?.result.forEach(transaction => {
        if((transaction.from == searchAddressString) && transaction.to) {
            addNodeToGraph(data, transaction.to, "", "", NodeAddressType.PEER, "")
            addEdgeToGraph(data, searchAddressString, transaction.to, EdgeType.TRANSACTION, "")
        } else if ((transaction.to == searchAddressString) && transaction.from) {
            addNodeToGraph(data, transaction.from, "", "", NodeAddressType.PEER, "")
            addEdgeToGraph(data, transaction.from, searchAddressString, EdgeType.TRANSACTION, "")
        }        
    })
}

function addSearchAddressToGraph(data: GraphData, searchAddress?: SearchUserInfoResp) {
    if(searchAddress?.identity) {        
        addNodeToGraph(data, searchAddress.identity.address, searchAddress.identity.ens, searchAddress.identity.avatar, NodeAddressType.MAIN, "");        
    }
}

function addNodeToGraph(data: GraphData, id: string, ens: string, avatar: string, type: NodeAddressType, nodeName: string ) {
    const node = {
        "id": id,
        "ens": ens,
        "avatar": avatar,
        "type": type,
        "name": nodeName,
    };

    // Enrich node information
    Object.keys(knownEthAddresses).forEach((exchangeName) => {
            const exchangeAddress = knownEthAddresses[exchangeName];

            if (exchangeAddress == id) {
                node.type = NodeAddressType.EXCHANGE;
                node.name = exchangeName;
            }
        })

    const existingNodes = data.nodes.filter(existingNode => existingNode["id"] == node["id"])
    existingNodes.length ? "" : data.nodes.push(node)
}

function addEdgeToGraph(data: GraphData, from: string, to: string, type: EdgeType, recommendationReason: string) {
    const edge = {
        "from": from,
        "to": to,
        "types": [type],
        "recommendationReason": recommendationReason,
    };

    const existingEdges = data.edges.filter(existingEdge => (existingEdge["from"] == edge["from"]) && (existingEdge["to"] == edge["to"]))
    if(existingEdges.length > 0) {
        const existingEdgeTypes = existingEdges[0]["types"];
        existingEdgeTypes.indexOf(type) === -1 ? existingEdgeTypes.push(type) : ""
    } else {
        data.edges.push(edge)
    }
}
