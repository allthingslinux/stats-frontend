import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import Graph from "graphology";
import { parse } from "graphology-gexf";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";
import '@react-sigma/core/lib/style.css';
import { useLayoutCircular } from "@react-sigma/layout-circular";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { createNodeImageProgram } from "@sigma/node-image";
import { getColor, getNodeSize, getNodeColor, resetGraphView, handleClickNode } from "./Utils";
import { Complete } from "./components/Controls";
import { drawLabel, drawHover } from "./GraphRenderers";
import { weightedDegree } from "graphology-metrics/node";
import { FocusOnNode } from "./FocusOnNode";

// ---------------------------------------------------------------------
// Sigma Container Style (based on dark mode setting)
// ---------------------------------------------------------------------
const sigmaStyle: React.CSSProperties = {
  backgroundColor: document.cookie.includes("darkMode=true") ? "#000" : undefined,
  height: "100vh",
  width: "100vw",
};

if (document.cookie.includes("darkMode=true")) {
  document.documentElement.classList.add("dark");
}

// ---------------------------------------------------------------------
// Graph Loading Component
// ---------------------------------------------------------------------
/**
 * LoadGraph Component:
 * - Fetches and parses the GEXF file.
 * - Computes node weights.
 * - Sets initial node positions and custom attributes.
 * - Applies both circular and forceAtlas2 layouts.
 */
export const LoadGraph: React.FC = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutCircular();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    (async () => {
      try {
        const gexfUrl = import.meta.env.VITE_GEXF_URL;
        if (!gexfUrl) throw new Error("VITE_GEXF_URL environment variable not set");

        console.log("Fetching graph data from:", gexfUrl);
        const response = await fetch(gexfUrl);
        const gexfText = await response.text();
        const graph = parse(Graph, gexfText);
        console.log("Graph parsed successfully.");

        // Compute and assign weighted degree for each node.
        graph.forEachNode((node: string) => {
          const weight = weightedDegree(graph, node);
          graph.setNodeAttribute(node, "tag", weight);
        });

        /*
        // Cull nodes below the 75th percentile.
        const allNodes = graph.nodes();
        const tags = allNodes.map((node: string) => graph.getNodeAttribute(node, "tag"));
        const cutoff = tags.sort((a, b) => a - b)[Math.floor(tags.length * 0.75)];
        let removedNodes = 0;
        allNodes.forEach((node: string) => {
          if (graph.getNodeAttribute(node, "tag") < cutoff) {
            graph.dropNode(node);
            removedNodes++;
          }
        });
        const descriptionEl = document.querySelector(".culling");
        if (descriptionEl) {
          descriptionEl.innerHTML += `<br/>Removed <b>${removedNodes}/${allNodes.length}</b> nodes. Weight cutoff: <b>${cutoff}</b>`;
        }
        console.log(`Nodes culled: ${removedNodes} removed (cutoff: ${cutoff}).`);

        // Cull edges below the 75th percentile based on weight.
        const edges = graph.edges();
        const edgeWeights = edges.map((edge: string) => graph.getEdgeAttribute(edge, "weight"));
        const edgeCutoff = edgeWeights.sort((a, b) => a - b)[Math.floor(edgeWeights.length * 0.75)];
        let hiddenEdges = 0;
        edges.forEach((edge: string) => {
          const weight = graph.getEdgeAttribute(edge, "weight");
          const shouldHide = weight < edgeCutoff;
          graph.setEdgeAttribute(edge, "defaultHidden", shouldHide);
          if (shouldHide) {
            graph.setEdgeAttribute(edge, "hidden", true);
            graph.setEdgeAttribute(edge, "culled", true);
            hiddenEdges++;
          } else {
            graph.removeEdgeAttribute(edge, "hidden");
          }
        });
        if (descriptionEl) {
          descriptionEl.innerHTML += `<br/>Hidden <b>${hiddenEdges}/${edges.length}</b> edges. Weight cutoff: <b>${edgeCutoff}</b>`;
        }
        console.log(`Edges culled: ${hiddenEdges} hidden (cutoff: ${edgeCutoff}).`);
        */

        // Initialize node positions 
        graph.forEachNode((node: string) => {
          graph.setNodeAttribute(node, "x", 0);
          graph.setNodeAttribute(node, "y", 0);
        });

        // Load custom node images.
        fetch("/custom.json")
          .then((res) => res.json())
          .then((data) => {
            data.nodes.forEach((node: { id: string; image: string }) => {
              if (graph.hasNode(node.id)) {
                graph.setNodeAttribute(node.id, "type", "image");
                graph.setNodeAttribute(node.id, "image", node.image);
              }
            });
            console.log("Custom node images loaded.");
          })
          .catch((error) => console.error("Error loading custom JSON:", error));

        // Process edge sizes and colors based on weight.
        let minWeight = Infinity;
        let maxWeight = -Infinity;
        graph.forEachEdge((edge: string) => {
          const weight = graph.getEdgeAttribute(edge, "weight");
          minWeight = Math.min(minWeight, weight);
          maxWeight = Math.max(maxWeight, weight);
        });
        const [minEdgeMult, maxEdgeMult] = [0.2, 10];
        graph.forEachEdge((edge: string) => {
          const weight = graph.getEdgeAttribute(edge, "weight");
          const size = minEdgeMult + ((maxEdgeMult - minEdgeMult) * (weight - minWeight)) / (maxWeight - minWeight);
          const alpha = 0.1 + ((1 - 0.1) * (weight - minWeight)) / (maxWeight - minWeight);
          graph.setEdgeAttribute(edge, "size", size);
          graph.setEdgeAttribute(
            edge,
            "color",
            getColor(weight, minWeight, maxWeight) + Math.floor(alpha * 255).toString(16)
          );
        });

        // Set node sizes and colors.
        graph.forEachNode((node: string) => {
          graph.setNodeAttribute(node, "size", getNodeSize(graph, node));
          graph.setNodeAttribute(node, "color", getNodeColor(graph, node));
        });

        // Load the graph into Sigma and apply circular layout.
        loadGraph(graph);
        assign();
        console.log("Graph loaded into Sigma container.");

        // Apply forceAtlas2 layout for further refinement.
        const settings = forceAtlas2.inferSettings(graph);
        forceAtlas2.assign(graph, {
          iterations: 50,
          settings: { scalingRatio: 250, ...settings },
        });
        console.log("forceAtlas2 layout applied.");
      } catch (error) {
        console.error("Error loading graph:", error);
      }
    })();
  }, [loadGraph, assign]);

  return null;
};

// ---------------------------------------------------------------------
// Event Registration Component
// ---------------------------------------------------------------------
/**
 * GraphEvents Component:
 * Registers event handlers for node and stage clicks.
 */
const GraphEvents: React.FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log("Node click event:", event);
        handleClickNode(graph, event.node);
      },
      clickStage: () => {
        console.log("Stage click event: resetting view");
        resetGraphView(graph);
      },
    });
  }, [registerEvents, graph]);

  return null;
};

// ---------------------------------------------------------------------
// Main Display and App Components
// ---------------------------------------------------------------------
/**
 * DisplayGraph Component:
 * Sets up the SigmaContainer with custom settings and renders the graph.
 */
export const DisplayGraph: React.FC = () => (
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

/**
 * Root App Component.
 * Moved the state and related effects inside the component.
 */
const App: React.FC = () => {
  const [selectedNode] = useState<string | null>(null);
  const [focusNode] = useState<string | null>(null);

  useEffect(() => {
    if (focusNode) {
      console.log("Focusing on node:", focusNode);
      FocusOnNode({ node: focusNode, move: true });
    }
  }, [focusNode]);

  useEffect(() => {
    if (selectedNode) {
      console.log("Selected node:", selectedNode);
      FocusOnNode({ node: selectedNode, move: true });
    }
  }, [selectedNode]);

  return (
    <div className="App">
      <DisplayGraph />
    </div>
  );
};

export default App;
