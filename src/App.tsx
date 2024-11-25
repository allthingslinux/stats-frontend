import './index.css'

import { useEffect } from "react";
import Graph from "graphology";
import { parse } from 'graphology-gexf';
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";

//const sigmaStyle = { height: "500px", width: "500px" };
// use whole screen
const sigmaStyle = { height: "100vh", width: "100vw" };

// Component that load the graph
export const LoadGraph = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const gexfUrl = import.meta.env.VITE_GEXF_URL;
    if (!gexfUrl) { throw new Error("REACT_APP_GEXF_URL environment variable not set"); }
    fetch(gexfUrl)
      .then((res) => res.text())
      .then((gexf) => {
        const graph = parse(Graph, gexf);

        // add random layout
        graph.forEachNode((node) => {
          graph.setNodeAttribute(node, "x", Math.random());
          graph.setNodeAttribute(node, "y", Math.random());
        });

        loadGraph(graph);
      });
  }, [loadGraph]);

  return null;
};

// Component that display the graph
export const DisplayGraph = () => {
  return (
    <SigmaContainer style={sigmaStyle}>
      <LoadGraph />
    </SigmaContainer>
  );
};
