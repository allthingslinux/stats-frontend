import './index.css'

import { FC, useEffect } from "react";
import Graph from "graphology";
import { parse } from 'graphology-gexf';
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutCircular } from '@react-sigma/layout-circular';

//const sigmaStyle = { height: "500px", width: "500px" };
// use whole screen
const sigmaStyle = { height: "100vh", width: "100vw" };

const Fa2: FC = () => {
  const { start, kill } = useWorkerLayoutForceAtlas2({ settings: { 
    slowDown: 10,
    gravity: 0.1,
    scalingRatio: 2,
    strongGravityMode: false,
    outboundAttractionDistribution: false,
    linLogMode: false,
    adjustSizes: false,
    barnesHutOptimize: false,
    barnesHutTheta: 0.5,
    edgeWeightInfluence: 1.5,
   }});

  useEffect(() => {
    // start FA2
    start();

    // Kill FA2 on unmount
    return () => {
      kill();
    };
  }, [start, kill]);

  return null;
};

// Component that load the graph
export const LoadGraph = () => {
  const loadGraph = useLoadGraph();
  const { positions, assign } = useLayoutCircular();

  useEffect(() => {
    const gexfUrl = import.meta.env.VITE_GEXF_URL;
    if (!gexfUrl) { throw new Error("REACT_APP_GEXF_URL environment variable not set"); }
    fetch(gexfUrl)
      .then((res) => res.text())
      .then((gexf) => {
        const graph = parse(Graph, gexf);

        // set 0,0 for all nodes
        graph.forEachNode((node) => {
          graph.setNodeAttribute(node, 'x', 0);
          graph.setNodeAttribute(node, 'y', 0);
        });

        loadGraph(graph);
        assign();
        console.log(positions());
      });
  }, [loadGraph, assign, positions]);

  return null;
};

// Component that display the graph
export const DisplayGraph = () => {
  return (
    <SigmaContainer style={sigmaStyle}>
      <LoadGraph />
      <Fa2 />
    </SigmaContainer>
  );
};
