import React from 'react'
import {useState} from 'react'
import {tabs as tabdata} from './data.js'

const Tabs = () => {
    const [activeTab, setActiveTab] =  useState("profile")

    const handleActiveTab = (id) =>{
       setActiveTab(id)
    }
    const activeTabContent = tabdata.find((tab)=> tab.id === activeTab)
    
    return (
    <div>
        <h1>Tabs</h1>
        <div style = {{display:"flex", justifyContent:"space-between", width: "500px" }}>
            {tabdata.map((tab)=>{
                return(
                    <div style={{cursor:"pointer", textAlign:"start"}}key={tab.id} onClick = {()=>{handleActiveTab(tab.id)}}>{tab.label}</div>
                )
            })}
        </div>
        <div style={{paddingTop:"10px", textAlign:"start"}}>{activeTabContent?.content}</div>
      
    </div>
  )
}

export default Tabs
