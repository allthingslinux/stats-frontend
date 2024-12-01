import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import AnimateHeight from "react-animate-height";

const DURATION = 300;

const Panel: FC<PropsWithChildren<{ title: ReactNode | string; initiallyDeployed?: boolean }>> = ({
  title,
  initiallyDeployed,
  children,
}) => {
  const [isDeployed, setIsDeployed] = useState(initiallyDeployed || false);
  const dom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDeployed)
      setTimeout(() => {
        if (dom.current) dom.current.parentElement?.scrollTo({ top: dom.current.offsetTop - 5, behavior: "smooth" });
      }, DURATION);
  }, [isDeployed]);

  return (
    <div className="panel" ref={dom}>
      <h2 className="flex items-center justify-between">
        <span>{title}</span>
        <button
          type="button"
          onClick={() => setIsDeployed((v) => !v)}
          className="p-2"
        >
          {isDeployed ? (
            <MdExpandLess style={{ fontSize: "1.5rem" }} />
          ) : (
            <MdExpandMore style={{ fontSize: "1.5rem" }} />
          )}
        </button>
      </h2>
      <AnimateHeight duration={DURATION} height={isDeployed ? "auto" : 0}>
        {children}
      </AnimateHeight>
    </div>
  );
};

const DescriptionPanel: FC = () => {
  return (
    <Panel
      initiallyDeployed
      title={
        <div className="flex items-center m-2 space-x-2">
          <BsInfoCircle className="text-muted" /> <b>About</b>
        </div>
      }
    >
      <div className="p-2">
        This is a graph for the All Things Linux Discord server.<br />
        <br />
        This tracks how much different users ping/reply ping each other in the server. The more a user pings another
        user, the closer they are in the graph and the thicker the line between them.<br />
        <br />
        Nodes with question marks are anonymous users. Users are anonymous by default, but can choose to reveal their
        identity by running a command.<br />
        Nodes with different icons just got it for some random reason. Generally for some accomplishment.<br />
        <br />
        Created by the All Things Linux team and the <a href="https://accuratelinuxgraphs.com" className="underline">accuratelinuxgraphs</a> team.<br />
        Backend available at <a href="https://stats-backend.atl.dev" className="underline">https://stats-backend.atl.dev</a>.<br />
        <br />
        Data collection started on 2024-11-24.<br />
        Data is only collected from the #general channel.<br />
        <br />
        To toggle anonymous please run the command "s$toggleanonymous" in the #bot-commands channel.<br />
      </div>
    </Panel>
  );
};

export default DescriptionPanel;
