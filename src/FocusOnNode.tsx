import { useCamera, useSigma } from '@react-sigma/core';
import { FC, useEffect } from 'react';
import { handleClickNode, resetGraphView } from './Utils';

export const FocusOnNode: FC<{ node: string | null; move?: boolean; highlight?: boolean }> = ({ node, move, highlight }) => {
  // Get sigma
  const sigma = useSigma();
  // Get camera hook
  const { gotoNode } = useCamera();

  /**
   * When the selected item changes, highlighted the node and center the camera on it.
   */
  useEffect(() => {
    if (!node) return;
    sigma.getGraph().setNodeAttribute(node, 'highlighted', true);
    if (move) gotoNode(node);
    handleClickNode(sigma.getGraph(), node);

    return () => {
      if (!highlight) {
        sigma.getGraph().setNodeAttribute(node, 'highlighted', false);
        resetGraphView(sigma.getGraph());
      }
    };
  }, [node, move, highlight, sigma, gotoNode]);

  return null;
};