import { FC, useEffect, useState } from "react";
import Graph from "graphology";
import circular from "graphology-layout/circular";
import { Attributes } from "graphology-types";
import { useSigma, useRegisterEvents, useLoadGraph, useSetSettings } from "react-sigma-v2";
import { EdgeType, NodeAddressType, GraphData } from '@/utils/graphTypes';
import forceAtlas2 from "graphology-layout-forceatlas2";
import drawLabel from "@/utils/canvas-utils";
import { drawHover } from "@/utils/canvas-utils";

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

interface MyGraphProps {
  data: GraphData;
}

const EDGE_SIZE = 3;
const NODE_SIZE = 15;

export const MyGraph: FC<MyGraphProps> = ({ data }) => {
  const sigma = useSigma();
  
  const registerEvents = useRegisterEvents();
  const loadGraph = useLoadGraph();
  const setSettings = useSetSettings();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const graph = new Graph();

    // Create all nodes
    data.nodes.forEach((node) => {
      const nodeColor = (node.type == NodeAddressType.SELF) ? "#00207F" : ((node.type == NodeAddressType.SEARCH) ? "#5579C6" : ((node.type == NodeAddressType.EXCHANGE) ? "#01579B" : "#4Fc3F7"));
      graph.addNode(node.id, {
        nodeType: node.avatar ? "image" : "company",
        label: node.ens ? node.ens : (node.name ? node.name : node.id),
        size: NODE_SIZE,
        color: nodeColor,
        image: node.avatar,
        clusterLabel: node.type
      });
    });

    // Create all edges
    data.edges.forEach((edge) => {
      if(edge.types.indexOf(EdgeType.RECOMMENDATION) >= 0) {
        graph.addEdge(edge.from, edge.to, {
          type: "line",
          size: EDGE_SIZE,
          color: "#FEC763",
        });
      } else if(edge.types.indexOf(EdgeType.TRANSACTION) >= 0) {
        graph.addEdge(edge.from, edge.to, {
          type: "arrow",
          size: EDGE_SIZE,
          color: "#EA55B1",
        });
      } else {
        graph.addEdge(edge.from, edge.to, {
          type: "arrow",
          size: EDGE_SIZE,
          color: "#A992FA",
        });
      }
    });

    circular.assign(graph);
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 100 });
    loadGraph(graph, false);
  }, [loadGraph, data]);

  useEffect(() => {
    registerEvents({
      enterNode({ node }) {
        setHoveredNode(node);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) {
          mouseLayer.classList.add("mouse-pointer");
        }
      },
      leaveNode() {
        setHoveredNode(null);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) {
          mouseLayer.classList.remove("mouse-pointer");
        }
      },
      clickNode: ({ node }) => {
        const newWindow = window.open("https://app.cyberconnect.me/address/" + node, '_blank');
        //TODO: Expand graph onClick on a node
        //const newWindow = window.open("https://etherscan.io/address/" + node, '_blank');
        if (newWindow) {
          newWindow.focus();
        }
      },
    });
  }, [sigma, registerEvents]);

  useEffect(() => {
    setSettings({
      nodeProgramClasses: { image: getNodeProgramImage() },
      labelRenderer: drawLabel,
      nodeReducer: (node: string, data: { [key: string]: unknown }) => {
        const graph = sigma.getGraph();
        const newData: Attributes = { ...data, highlighted: data.highlighted || false };

        if (hoveredNode) {
          if (node === hoveredNode || (graph.neighbors(hoveredNode) as Array<string>).includes(node)) {
            newData.highlighted = true;
          } else {
            newData.color = "#E2E2E2";
            newData.highlighted = false;
          }
        }

        return newData;
      },
      edgeReducer: (edge: string, data: { [key: string]: unknown }) => {
        const graph = sigma.getGraph();
        const newData = { ...data, hidden: false };
        if (hoveredNode && !(graph.extremities(edge) as Array<string>).includes(hoveredNode)) {
          newData.hidden = true;
        }
        return newData;
      },
      hoverRenderer: (context, data, settings) =>
        drawHover(context, { ...sigma.getNodeDisplayData(data.key), ...data }, settings),
    });
  }, [sigma, setSettings, hoveredNode]);

  return null;
};