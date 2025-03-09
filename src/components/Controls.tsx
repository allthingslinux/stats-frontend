import { FC, memo, useCallback, useState } from "react";
import {
  ControlsContainer,
  ZoomControl,
  FullScreenControl,
} from "@react-sigma/core";
import { GraphSearch, GraphSearchOption } from "@react-sigma/graph-search";
import "@react-sigma/core/lib/style.css";
import "@react-sigma/graph-search/lib/style.css";
import { FaqPanel, CullingPanel, InfoPanel } from "./Menu";
import DarkModeControl from "./DarkModeButton";
import "../index.css";
import { MiniMap } from '@react-sigma/minimap';
import { FocusOnNode } from "../FocusOnNode"; // Import your FocusOnNode component

export const Complete: FC = memo(() => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [focusNode, setFocusNode] = useState<string | null>(null);

  const onFocus = useCallback((value: GraphSearchOption | null) => {
    if (value === null) setFocusNode(null);
    else if (value.type === "nodes") setFocusNode(value.id);
  }, []);

  const onChange = useCallback((value: GraphSearchOption | null) => {
    if (value === null) setSelectedNode(null);
    else if (value.type === "nodes") setSelectedNode(value.id);
  }, []);

  const postSearchResult = useCallback(
    (options: GraphSearchOption[]): GraphSearchOption[] => {
      return options.length <= 10
        ? options
        : [
            ...options.slice(0, 10),
            {
              type: "message",
              message: (
                <span className="text-center text-muted">
                  And {options.length - 10} others
                </span>
              ),
            },
          ];
    },
    []
  );

  return (
    <>
      <ControlsContainer
        position={"top-right"}
        className="opacity-85"
      >
        <ZoomControl className="[&&>*]:flex [&>*]:justify-center [&>*]:items-center" />
        <FullScreenControl className="[&&>*]:flex [&>*]:justify-center [&>*]:items-center" />
        <DarkModeControl className="[&&>*]:flex [&>*]:justify-center [&>*]:items-center" />
      </ControlsContainer>
      <ControlsContainer position={'top-left'} className="opacity-85">
        <MiniMap width="100px" height="100px" />
      </ControlsContainer>
      <ControlsContainer
        position={"bottom-right"}
        className="lg:w-2/6 w-full opacity-85"
      >
        <div className="flex flex-col items-center">
          <GraphSearch
            type="nodes"
            value={selectedNode ? { type: "nodes", id: selectedNode } : null}
            onFocus={onFocus}
            onChange={onChange}
            postSearchResult={postSearchResult}
            className="w-full px-2"
          />
        </div>
        <InfoPanel />
        <FaqPanel />
        <CullingPanel />
      </ControlsContainer>
      {/* Render FocusOnNode so that it reacts to focusNode changes */}
      <FocusOnNode node={focusNode} move={true} />
    </>
  );
});
