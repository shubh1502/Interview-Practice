import React, {useEffect} from "react";

const Modal = ({ onClose }) => {
  const outerStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const innerStyle = {
    backgroundColor: "white",
    color: "black",
    padding: "10px",
    minWidth: "300px",
  };
  return (
    <div style={outerStyle} onClick={onClose}>
      <div style={innerStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Hi I am Modal</h2>
        <button onClick={onClose}>Close Modal</button>
      </div>
    </div>
  );
};

export default Modal;
