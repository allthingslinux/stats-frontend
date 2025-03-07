import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState, useMemo } from "react";
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

  const memoizedAnimateHeight = useMemo(() => (
    <AnimateHeight duration={DURATION} height={isDeployed ? "auto" : 0}>
      {children}
    </AnimateHeight>
  ), [isDeployed, children]);

  const memoizedMdExpandLess = useMemo(() => (
    <MdExpandLess style={{ fontSize: "1.5rem" }} />
  ), []);

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
            memoizedMdExpandLess
          ) : (
            <MdExpandMore style={{ fontSize: "1.5rem" }} />
          )}
        </button>
      </h2>
      {memoizedAnimateHeight}
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
      <div className="px-2 text-sm description">
        This tracks how much different users ping/reply ping each other in the All Things Linux server. The more a user pings another
        user, the closer they are in the graph and the thicker the line between them.<br />
        <br />
        Created by the All Things Linux and Accurate Linux Graphs.<br />
        Backend and source graph files available at <a href="https://stats-backend.atl.dev" className="underline">https://stats-backend.atl.dev</a>.<br />
        <br />
        Data collection started on 2024-11-24 in the #general channel. There was a outage between 2025-02-22 (estimated) and 2025-03-07.<br />
        <br />
        If you do not show up in the graph, run <b>s$toggleanonymous</b>. If you still do not show up, you most likely were culled (details below). Please wait a bit until you have more activity.<br />
      </div>
    </Panel>
  );
};

export default DescriptionPanel;
