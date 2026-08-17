import React from "react";
import { tabs as tabData } from "./data";
import { useEffect, useState } from "react";

const Tabs_new = () => {
  const [isActive, setIsActive] = useState("");

  const handleActiveTab = (id) => {
    console.log(id)
    const activeID = tabData.find((singledata)=>{return singledata.id === id})
    setIsActive(activeID)
  };

  useEffect(()=>{
    console.log(isActive)
  },[isActive])

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          cursor:'pointer'
        }}
      >
        {tabData.map((singledata) => {
          return (
            <div key={singledata.id} style={{ padding: "20px" }} onClick={() => {handleActiveTab(singledata.id)}}>
              {singledata.label} 
            </div>
          );
        })}
      </div>
      <div>{isActive?.content}</div>
    </div>
  );
};

export default Tabs_new;
