import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState, useMemo } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
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
        <b>Want to see all nodes and edges? Open the .gexf file in Gephi or search your name to see all connections.</b>
      </div>
    </Panel>
  );
};

export default CullingPanel;
