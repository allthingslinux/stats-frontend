import React, { useEffect, useRef } from "react";
import "./index.css";
import Graph from "graphology";
import { parse } from "graphology-gexf";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { createNodeImageProgram } from "@sigma/node-image";
import { getColor, getNodeSize, getNodeColor } from "./Utils";
import { Complete } from "./components/Controls";
import { drawLabel, drawHover } from "./GraphRenderers";
import { weightedDegree } from "graphology-metrics/node";

let sigmaStyle: React.CSSProperties;
if (document.cookie.includes("darkMode=true")) {
  sigmaStyle = { backgroundColor: "#080808", height: "100vh", width: "100vw" };
  document.documentElement.classList.add("dark");
} else {
  sigmaStyle = { height: "100vh", width: "100vw" };
}

// Create a resetGraphView function
const resetGraphView = (graph: Graph) => {
  // Show all nodes
  graph.forEachNode((node: string) => {
    if (graph.getNodeAttribute(node, "hiddenFromClick")) {
      graph.removeNodeAttribute(node, "hidden");
      graph.removeNodeAttribute(node, "hiddenFromClick");
    }
  });

  // Show all edges
  graph.forEachEdge((edge: string) => {
    if (graph.getEdgeAttribute(edge, "culled")) {
      graph.setEdgeAttribute(edge, "hidden", true);
    } else {
      graph.removeEdgeAttribute(edge, "hidden");
    }
  });

  // Unhighlight all nodes
  graph.forEachNode((node: string) => {
    graph.removeNodeAttribute(node, "highlighted");
  });

  // Revert node sizes
  graph.forEachNode((node: string) => {
    if (graph.getNodeAttribute(node, "sizeDoubled")) {
      graph.setNodeAttribute(node, "size", graph.getNodeAttribute(node, "size") / 2);
      graph.removeNodeAttribute(node, "sizeDoubled");
    }
  });
  graph.forEachNode((node: string) => {
    if (graph.getNodeAttribute(node, "sizeQuadrupled")) {
      graph.setNodeAttribute(node, "size", graph.getNodeAttribute(node, "size") / 4);
      graph.removeNodeAttribute(node, "sizeQuadrupled");
    }
  });
};

const handleClickNode = (graph: Graph, node: string) => {
  if (!node) return;

  // If node clicked is doubled, reset graph view and return
  if (graph.getNodeAttribute(node, "sizeDoubled")) {
    resetGraphView(graph);
    return;
  }

  resetGraphView(graph);

  const neighbors = graph.neighbors(node);
  neighbors.push(node);

  graph.forEachNode((n) => {
    if (!neighbors.includes(n)) {
      graph.setNodeAttribute(n, "hidden", true);
      graph.setNodeAttribute(n, "hiddenFromClick", true);
    }
  });

  graph.forEachEdge((edge) => {
    if (graph.getEdgeAttribute(edge, "culled")) {
      graph.removeEdgeAttribute(edge, "hidden");
    }
  });

  graph.forEachEdge((edge) => {
    const source = graph.source(edge);
    const target = graph.target(edge);
    if (source !== node && target !== node) {
      graph.setEdgeAttribute(edge, "hidden", true);
    }
  });

  graph.setNodeAttribute(node, "highlighted", true);

  graph.forEachNode((n) => {
    if (neighbors.includes(n)) {
      graph.setNodeAttribute(n, "size", graph.getNodeAttribute(n, "size") * 2);
      graph.setNodeAttribute(n, "sizeDoubled", true);
    }
  });
};

// Component that loads the graph from the GEXF file
export const LoadGraph: React.FC = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutCircular();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const gexfUrl = import.meta.env.VITE_GEXF_URL;
    if (!gexfUrl) {
      throw new Error("REACT_APP_GEXF_URL environment variable not set");
    }
    fetch(gexfUrl)
      .then((res) => res.text())
      .then((gexf) => {
        const graph = parse(Graph, gexf);

        graph.forEachNode((node: string) => {
          const weighted = weightedDegree(graph, node);
          graph.setNodeAttribute(node, "tag", weighted);
        });

        const nodes = graph.nodes();
        const nodeTags = nodes.map((node: string) =>
          graph.getNodeAttribute(node, "tag")
        );
        const cutoff =
          nodeTags.slice().sort((a, b) => a - b)[
            Math.floor(nodeTags.length * 0.75)
          ];
        let removedNodeCount = 0;
        nodes.forEach((node: string) => {
          if (graph.getNodeAttribute(node, "tag") < cutoff) {
            graph.dropNode(node);
            removedNodeCount++;
          }
        });

        const description = document.querySelector(".culling");
        if (description) {
          description.innerHTML += `<br />Removed <b>${removedNodeCount}</b> nodes. Cutoff: <b>${cutoff}</b>`;
        }

        const edges = graph.edges();
        const edgeWeights = edges.map((edge: string) =>
          graph.getEdgeAttribute(edge, "weight")
        );
        const edgeCutoff =
          edgeWeights.slice().sort((a, b) => a - b)[
            Math.floor(edgeWeights.length * 0.75)
          ];
        let hiddenEdgeCount = 0;
        edges.forEach((edge: string) => {
          const defaultHidden =
            graph.getEdgeAttribute(edge, "weight") < edgeCutoff;
          graph.setEdgeAttribute(edge, "defaultHidden", defaultHidden);
          if (defaultHidden) {
            graph.setEdgeAttribute(edge, "hidden", true);
            graph.setEdgeAttribute(edge, "culled", true);
            hiddenEdgeCount++;
          } else {
            graph.removeEdgeAttribute(edge, "hidden");
          }
        });

        if (description) {
          description.innerHTML += `<br />Hidden <b>${hiddenEdgeCount}</b> edges. Cutoff: <b>${edgeCutoff}</b>`;
        }

        graph.forEachNode((node: string) => {
          graph.setNodeAttribute(node, "x", 0);
          graph.setNodeAttribute(node, "y", 0);
        });

        graph.forEachNode((node: string) => {
          if (graph.getNodeAttribute(node, "label") === "Anonymous User") {
            graph.setNodeAttribute(node, "label", "");
            graph.setNodeAttribute(node, "type", "image");
            graph.setNodeAttribute(node, "image", "./QuestionMark.svg");
          }
        });

        fetch("/custom.json")
          .then((res) => res.json())
          .then((data) => {
            data.nodes.forEach((node: { id: string; image: string }) => {
              if (!graph.hasNode(node.id)) return;
              graph.setNodeAttribute(node.id, "type", "image");
              graph.setNodeAttribute(node.id, "image", node.image);
            });
          })
          .catch((error) => {
            console.error("Error loading custom JSON", error);
          });

        let minWeight = Infinity;
        let maxWeight = -Infinity;
        graph.forEachEdge((edge: string) => {
          const weight = graph.getEdgeAttribute(edge, "weight");
          if (weight < minWeight) minWeight = weight;
          if (weight > maxWeight) maxWeight = weight;
        });
        const minEdgeMult = 0.2;
        const maxEdgeMult = 10;
        graph.forEachEdge((edge: string) => {
          const weight = graph.getEdgeAttribute(edge, "weight");
          const size =
            minEdgeMult +
            ((maxEdgeMult - minEdgeMult) * (weight - minWeight)) /
              (maxWeight - minWeight);
          graph.setEdgeAttribute(edge, "size", size);
        });
        const alphaMin = 0.1;
        const alphaMax = 1;
        graph.forEachEdge((edge: string) => {
          const weight = graph.getEdgeAttribute(edge, "weight");
          const alpha =
            alphaMin +
            ((alphaMax - alphaMin) * (weight - minWeight)) /
              (maxWeight - minWeight);
          graph.setEdgeAttribute(
            edge,
            "color",
            getColor(weight, minWeight, maxWeight) +
              Math.floor(alpha * 255).toString(16)
          );
        });

        graph.forEachNode((node: string) => {
          const size = getNodeSize(graph, node);
          graph.setNodeAttribute(node, "size", size);
        });
        graph.forEachNode((node: string) => {
          const color = getNodeColor(graph, node);
          graph.setNodeAttribute(node, "color", color);
        });

        loadGraph(graph);
        assign();

        const sensibleSettings = forceAtlas2.inferSettings(graph);
        forceAtlas2.assign(graph, {
          iterations: 50,
          settings: {
            scalingRatio: 1000,
            ...sensibleSettings,
          },
        });
      });
  }, [loadGraph, assign]);

  return null;
};

// Simplified GraphEvents: handle only clickNode and clickStage.
const GraphEvents: React.FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => handleClickNode(graph, event.node),
      clickStage: () => resetGraphView(graph),
    });
  }, [registerEvents, graph]);

  return null;
};

export const DisplayGraph: React.FC = () => {
  return (
    <SigmaContainer
      style={sigmaStyle}
      settings={{
        nodeProgramClasses: { image: createNodeImageProgram() },
        defaultDrawNodeHover: drawHover,
        defaultDrawNodeLabel: drawLabel,
      }}
    >
      <LoadGraph />
      <GraphEvents />
      <Complete />
    </SigmaContainer>
  );
};

const App: React.FC = () => {
  return (
    <div className="App">
      <DisplayGraph />
    </div>
  );
};

export default App;
