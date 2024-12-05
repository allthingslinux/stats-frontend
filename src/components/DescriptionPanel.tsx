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
    <div className="panel dark:bg-black dark:text-white" ref={dom}>
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
      <div className="p-2 text-sm">
        This tracks how much different users ping/reply ping each other in the All Things Linux server. The more a user pings another
        user, the closer they are in the graph and the thicker the line between them.<br />
        <br />
        Nodes with question marks are anonymous users. Users are anonymous by default, but can choose to reveal their
        identity by running a command.<br />
        Nodes with different icons generally got it for a accomplishment.<br />
        <br />
        Created by the All Things Linux and Accurate Linux Graphs.<br />
        Backend available at <a href="https://stats-backend.atl.dev" className="underline">https://stats-backend.atl.dev</a>.<br />
        <br />
        Data collection started on 2024-11-24 in the #general channel.<br />
        <br />
        If you do not show up please use the command "s$toggleanonymous".<br />
      </div>
    </Panel>
  );
};

export default DescriptionPanel;
