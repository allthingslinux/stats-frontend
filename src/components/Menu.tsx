import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState, useMemo } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import AnimateHeight from "react-animate-height";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosStats } from "react-icons/io";

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

const InfoPanel: FC = () => {
  return (
    <Panel
      initiallyDeployed
      title={
        <div className="flex items-center m-2 space-x-2">
          <IoIosStats className="text-muted" /> <b>Info</b>
        </div>
      }
    >
      <div className="px-2 text-sm">
        <b>Welcome to stats.atl.dev!</b><br />
        <p>This tracks how much different users ping/reply ping each other in the All Things Linux server. The more a user pings another
        user, the closer they are in the graph and the thicker the line between them.</p><br />
        <br />
        <b>Created by All Things Linux and Accurate Linux Graphs.</b><br />
        <p>Backend and source graph files available at <a href="https://stats-backend.atl.dev" className="underline">https://stats-backend.atl.dev</a>.</p><br />
        <a href="https://stats-backend.atl.dev/privacy" className="underline">Privacy Policy</a>
      </div>
    </Panel>
  );
};

const FaqPanel: FC = () => {
  return (
    <Panel
      title={
        <div className="flex items-center m-2 space-x-2">
          <BsInfoCircle className="text-muted" /> <b>FAQ</b>
        </div>
      }
    >
      <div className="px-2 text-sm description">
        <i>Why am I not showing up in the graph?</i><br />
        If you do not show up in the graph, run <b>s$optin</b>. If you still do not show up, you most likely were culled (details below). Please wait a bit until you have more activity.<br />
        <br />
        <i>How long has data been collected?</i><br />
        Data collection started on 2024-11-24 in the #general channel. There was a outage between 2025-02-22 (estimated) and 2025-03-07.<br />
        <br />
        <i>What happened to my data?</i><br />
        If you leave the server, you are automatically opted out and as such your data is removed. This also happens if you opt out manually. (s$optout)<br />
        <br />
        <i>Where is the source code?</i><br />
        <a href="https://github.com/allthingslinux/stats-backend" className="underline">Backend source code</a><br />
        <a href="https://github.com/allthingslinux/stats-frontend" className="underline">Frontend source code</a><br />
      </div>
    </Panel>
  );
};

const CullingPanel: FC = () => {
  return (
    <Panel
      title={
        <div className="flex items-center m-2 space-x-2">
          <FaRegTrashAlt className="text-muted" /> <b>Culling</b>
        </div>
      }
    >
      <div className="px-2 text-sm culling">
        <b>Want to see all nodes and edges? Open the .gexf file in Gephi or click a node to see all connections.</b>
      </div>
    </Panel>
  );
};

export { FaqPanel, CullingPanel, InfoPanel };
