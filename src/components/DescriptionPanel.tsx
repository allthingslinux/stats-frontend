import { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC = () => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <div className="flex items-center m-2 space-x-2">
            <BsInfoCircle className="text-muted" /> <b>About</b>
          </div>
        </>
      }
    >   
        <div className="p-2">
            This is a graph for the All Things Linux Discord server.<br />
            <br />
            This tracks how much different users ping/reply ping each other in the server. The more a user pings another user, the closer they are in the graph and the thicker the line between them.<br />
            <br />
            Nodes with question marks are anonymous users. Users are anonymous by default, but can choose to reveal their identity by running a command.<br />
            <br />
            Created by the All Things Linux team and the accuratelinuxgraphs.com team.<br />
            Backend available at stats-backend.atl.dev
        </div>
    </Panel>
  );
};

export default DescriptionPanel;