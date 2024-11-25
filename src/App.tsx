import './index.css'

import { useEffect } from "react";
import Graph from "graphology";
import { parse } from 'graphology-gexf';
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useLayoutCircular } from '@react-sigma/layout-circular';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import colormap from 'colormap';
import { weightedDegree } from 'graphology-metrics/node/weighted-degree';
import { createNodeImageProgram } from "@sigma/node-image";

//const sigmaStyle = { height: "500px", width: "500px" };
// use whole screen
const sigmaStyle = { height: "100vh", width: "100vw" };

// const Fa2: FC = () => {
//   const { start, kill } = useWorkerLayoutForceAtlas2({ settings: { 
//     slowDown: 100,
//     gravity: 0.5,
//     //scalingRatio: 2,
//     //edgeWeightInfluence: 1.5,
//    }});

//   useEffect(() => {
//     // start FA2
//     start();

//     // Kill FA2 on unmount
//     return () => {
//       kill();
//     };
//   }, [start, kill]);

//   return null;
// };

// colormap function
const cmap = colormap({
  colormap: 'bluered',
  nshades: 101,
  format: 'hex',
  alpha: [0, 1],
});

function getColor(value: number, min: number, max: number) {
  // make sure not to go out of bounds else the color will be black
  if (value < min) { value = min; }
  if (value > max) { value = max; }
  const idx = Math.floor((value - min) / (max - min) * 100);
  return cmap[idx];
}

function scale(value: number, min: number, max: number, newMin: number, newMax: number) {
  return newMin + (newMax - newMin) * (value - min) / (max - min);
}

function getMinMaxWeightedDegrees(graph: Graph) {
  let minDegree = Infinity;
  let maxDegree = -Infinity;
  graph.forEachNode((node) => {
    const degree = weightedDegree(graph, node);
    if (degree < minDegree) { minDegree = degree; }
    if (degree > maxDegree) { maxDegree = degree; }
  });
  return { minDegree, maxDegree };
}

function getNodeSize(graph: Graph, node: string) {
  const degree = weightedDegree(graph, node);
  const { minDegree, maxDegree } = getMinMaxWeightedDegrees(graph);
  return scale(degree, minDegree, maxDegree, 5, 20);
}

function getNodeColor(graph: Graph, node: string) {
  const degree = weightedDegree(graph, node);
  const { minDegree, maxDegree } = getMinMaxWeightedDegrees(graph);
  return getColor(degree, minDegree, maxDegree);
}

// Component that load the graph
export const LoadGraph = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutCircular();

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

        // map weight to size of edges
        const minEdgeMult = 0.1; // minimum multiplier from weight to size
        const maxEdgeMult = 10; // maximum multiplier from weight to size

        // find all users called "Anonymous User" and change the label to nothing and change the icon to ./Question_Mark.svg
        graph.forEachNode((node) => {
          if (graph.getNodeAttribute(node, 'label') === 'Anonymous User') {
            graph.setNodeAttribute(node, 'label', '');
            graph.setNodeAttribute(node, 'type', 'image');
            graph.setNodeAttribute(node, 'image', './Question_Mark.svg');
          }
        });

        // remove any nodes that have no edges
        graph.forEachNode((node) => {
          if (graph.degree(node) === 0) {
            graph.dropNode(node);
          }
        });

        // find min and max weight in edges
        let minWeight = Infinity;
        let maxWeight = -Infinity;
        graph.forEachEdge((edge) => {
          const weight = graph.getEdgeAttribute(edge, 'weight');
          if (weight < minWeight) { minWeight = weight; }
          if (weight > maxWeight) { maxWeight = weight; }
        });

        // set size of edges
        graph.forEachEdge((edge) => {
          const weight = graph.getEdgeAttribute(edge, 'weight');
          const size = minEdgeMult + (maxEdgeMult - minEdgeMult) * (weight - minWeight) / (maxWeight - minWeight);
          graph.setEdgeAttribute(edge, 'size', size);
        });

        // set color of edges
        const alphaMin = 0.1;
        const alphaMax = 1;
        // alpha can be done via rgba
        graph.forEachEdge((edge) => {
          const weight = graph.getEdgeAttribute(edge, 'weight');
          const alpha = alphaMin + (alphaMax - alphaMin) * (weight - minWeight) / (maxWeight - minWeight);
          graph.setEdgeAttribute(edge, 'color', getColor(weight, minWeight, maxWeight) + Math.floor(alpha * 255).toString(16));
        });

        // set size of nodes based on weighted degree
        graph.forEachNode((node) => {
          const size = getNodeSize(graph, node);
          graph.setNodeAttribute(node, 'size', size);
        });

        // set color of nodes based on weighted degree
        graph.forEachNode((node) => {
          const color = getNodeColor(graph, node);
          graph.setNodeAttribute(node, 'color', color);
        });

        loadGraph(graph);
        assign();

        forceAtlas2.assign(graph, {
          iterations: 1000,
          settings: {
            gravity: 0.5,
            scalingRatio: 500,
            edgeWeightInfluence: 1.5,
          },
        });
      });
  }, [loadGraph, assign]);

  return null;
};

// Component that display the graph
export const DisplayGraph = () => {
  return (
    <SigmaContainer style={sigmaStyle} settings={{ nodeProgramClasses: { image: createNodeImageProgram() } }}>
      <LoadGraph />
    </SigmaContainer>
  );
};
