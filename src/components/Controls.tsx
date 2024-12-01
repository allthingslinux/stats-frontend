import { FC } from "react";

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

export const Complete: FC = () => {
  return (
    // this crap <>
    // you have to wrap it in an empty element???? 
    // thank you react
    <>
      <ControlsContainer position={"bottom-right"} className="md:w-2/6 w-full opacity-85">
        <div className="flex flex-row align-middle">
          <SearchControl className="w-full px-2" />
          <ZoomControl className="[&&>*]:flex [&>*]:justify-center [&>*]:items-center" />
          <FullScreenControl className="[&&>*]:flex [&>*]:justify-center [&>*]:items-center" /> 
        </div>
        {/* <LayoutsControl /> */}
        <DescriptionPanel />
      </ControlsContainer>
    </>
  );
};
