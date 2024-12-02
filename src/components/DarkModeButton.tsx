import React, { CSSProperties, useEffect, useState } from "react";
import { MdDarkMode } from "react-icons/md";

/**
 * Properties for the `DarkModeControl` component.
 */
export interface DarkModeControlProps {
  /**
   * HTML class to apply to the button wrapper.
   */
  className?: string;

  /**
   * Inline CSS styles to apply to the button wrapper.
   */
  style?: CSSProperties;

  /**
   * Custom child element to replace the default dark mode icon.
   */
  children?: JSX.Element;

  /**
   * Label for the button, useful for accessibility and tooltips.
   */
  label?: string;
}

/**
 * `DarkModeControl` creates a button to toggle between light and dark modes.
 *
 * ```jsx
 * <DarkModeControl
 *   className="my-class"
 *   style={{ padding: "1rem" }}
 *   label="Toggle theme"
 * >
 *   <CustomIcon />
 * </DarkModeControl>
 * ```
 */
export const DarkModeControl: React.FC<DarkModeControlProps> = ({
  className = "",
  style,
  children,
  label = "Toggle Dark Mode",
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    document.cookie.includes("darkMode=true")
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.cookie = `darkMode=${darkMode}; path=/;`;
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    window.location.reload();
  };

  const buttonStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    padding: "0.5rem",
    fontSize: "1em",
    ...style,
  };

  return (
    <div
      className={`react-sigma-control ${className}`}
      style={{ display: "inline-block" }}
    >
      <button
        onClick={toggleDarkMode}
        title={label}
        style={buttonStyle}
        aria-label={label}
      >
        {children || <MdDarkMode style={{ width: "1em", height: "1em" }} />}
      </button>
    </div>
  );
};

export default DarkModeControl;