// Utilities primarily for App.tsx

import colormap from "colormap";
import Graph from "graphology";
import { weightedDegree } from "graphology-metrics/node/weighted-degree";

// Define colormap (now based on if in dark or light mode)
// Use 101 shades because 100 shades doesnt work
let cmap: string[];
if (document.cookie.includes("darkMode=true")) {
  cmap = colormap({
    colormap: "magma",
    nshades: 106,
    format: "hex",
    alpha: [0, 1],
  });
  // Remove the first 5 colors because they are too dark
  cmap = cmap.slice(5);
} else {
  cmap = colormap({
    colormap: "bluered",
    nshades: 101,
    format: "hex",
    alpha: [0, 1],
  });
}

/// Get color based on value
/// Used for coloring edges and nodes
function getColor(value: number, min: number, max: number) {
  // make sure not to go out of bounds else the color will be black
  if (value < min) {
    value = min;
  }
  if (value > max) {
    value = max;
  }
  const idx = Math.floor(((value - min) / (max - min)) * 100);
  return cmap[idx];
}

/// Utility function to scale a value from one range to another
function scale(
  value: number,
  min: number,
  max: number,
  newMin: number,
  newMax: number
) {
  return newMin + ((newMax - newMin) * (value - min)) / (max - min);
}

/// Get min and max weighted degrees in the graph
function getMinMaxWeightedDegrees(graph: Graph) {
  let minDegree = Infinity;
  let maxDegree = -Infinity;
  graph.forEachNode((node) => {
    const degree = weightedDegree(graph, node);
    if (degree < minDegree) {
      minDegree = degree;
    }
    if (degree > maxDegree) {
      maxDegree = degree;
    }
  });
  return { minDegree, maxDegree };
}

// Get size of a target node
function getNodeSize(graph: Graph, node: string) {
  const degree = weightedDegree(graph, node);
  const { minDegree, maxDegree } = getMinMaxWeightedDegrees(graph);
  return scale(degree, minDegree, maxDegree, 1.5, 15);
}

// Get color of a target node
function getNodeColor(graph: Graph, node: string) {
  const degree = weightedDegree(graph, node);
  const { minDegree, maxDegree } = getMinMaxWeightedDegrees(graph);
  return getColor(degree, minDegree, maxDegree);
}

/**
 * Reset the graph view by removing hidden and highlighted states and
 * reverting any node size modifications.
 */
const resetGraphView = (graph: Graph): void => {
  console.log("Resetting graph view");
  graph.forEachNode((node: string) => {
    // Remove hidden and highlight flags.
    if (graph.getNodeAttribute(node, "hiddenFromClick")) {
      graph.removeNodeAttribute(node, "hidden");
      graph.removeNodeAttribute(node, "hiddenFromClick");
    }
    if (graph.getNodeAttribute(node, "highlighted")) {
      graph.removeNodeAttribute(node, "highlighted");
    }
    graph.removeNodeAttribute(node, "clicked");
  });

  graph.forEachEdge((edge: string) => {
    // For culled edges, ensure they remain hidden.
    if (graph.getEdgeAttribute(edge, "culled")) {
      graph.setEdgeAttribute(edge, "hidden", true);
    } else {
      graph.removeEdgeAttribute(edge, "hidden");
    }
  });
};

/**
 * Handle a node click event by highlighting the clicked node and its neighbors,
 * while hiding unrelated nodes and adjusting edge visibility.
 */
const handleClickNode = (graph: Graph, clickedNode: string): void => {
  if (!clickedNode) return;
  console.log(`Node clicked: ${clickedNode}`);

  // If the node is already highlighted, reset the view.
  if (graph.getNodeAttribute(clickedNode, "clicked")) {
    resetGraphView(graph);
    return;
  }

  resetGraphView(graph);

  // Get the clicked node and its neighbors.
  const neighborNodes: string[] = graph.neighbors(clickedNode);
  neighborNodes.push(clickedNode);

  // Hide nodes that are not the clicked node or its neighbors.
  graph.forEachNode((node: string) => {
    if (!neighborNodes.includes(node)) {
      graph.setNodeAttribute(node, "hidden", true);
      graph.setNodeAttribute(node, "hiddenFromClick", true);
    }
  });

  // Process edges: if an edge connects to the clicked node, unhide culled edges;
  // otherwise, hide the edge.
  graph.forEachEdge((edge: string) => {
    const source = graph.source(edge);
    const target = graph.target(edge);
    if (source === clickedNode || target === clickedNode) {
      if (graph.getEdgeAttribute(edge, "culled")) {
        graph.removeEdgeAttribute(edge, "hidden");
      }
    } else {
      graph.setEdgeAttribute(edge, "hidden", true);
    }
  });

  // Highlight the clicked node.
  graph.setNodeAttribute(clickedNode, "highlighted", true);

  // add attribute saying that the node is clicked
  graph.setNodeAttribute(clickedNode, "clicked", true);
  console.log("Graph updated: highlighted node and its neighbors.");
};

export { getColor, scale, getNodeSize, getNodeColor, resetGraphView, handleClickNode };