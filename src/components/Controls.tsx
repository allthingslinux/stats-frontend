import { FC, CSSProperties } from "react";

import {
  ControlsContainer,
  ZoomControl,
  SearchControl,
  FullScreenControl,
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import DescriptionPanel from "./DescriptionPanel";
import "../index.css";

// import { LayoutsControl } from "../../common/LayoutsControl";

export const Complete: FC<{ _style?: CSSProperties }> = ({ _style }) => {
  return (
    // this crap <>
    // you have to wrap it in an empty element???? 
    // thank you react
    <>
      <ControlsContainer position={"bottom-right"} className="md:w-2/6 w-full">
        <div className="flex flex-row-reverse align-middle">
          <SearchControl className="w-2/6 px-2" />
          <ZoomControl style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }} >

          </ZoomControl>
          <FullScreenControl /> 
        </div>
        {/* <LayoutsControl /> */}
        <DescriptionPanel />
      </ControlsContainer>
    </>
  );
};
