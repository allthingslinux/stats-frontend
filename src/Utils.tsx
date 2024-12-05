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
  return scale(degree, minDegree, maxDegree, 1.5, 10);
}

// Get color of a target node
function getNodeColor(graph: Graph, node: string) {
  const degree = weightedDegree(graph, node);
  const { minDegree, maxDegree } = getMinMaxWeightedDegrees(graph);
  return getColor(degree, minDegree, maxDegree);
}

export { getColor, scale, getNodeSize, getNodeColor };
