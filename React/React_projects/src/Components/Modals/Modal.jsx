import React, { useEffect, useState } from "react";

const Modal = ({ onClose }) => {
  const outerStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const [image, setImage] = useState("");
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

  const handleImage = (e) => {
    setImage(e.target.files[0]);
  };

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
        <div style={{ display: "flex", flexDirection: "column", justifyContent:'center'}}>
          <input type="file" accept="image/*" onChange={handleImage} />

          {image && <img src={URL.createObjectURL(image)} alt="Preview"></img>}
        </div>

        <button onClick={onClose}>Close Modal</button>
      </div>
    </div>
  );
};

export default Modal;
