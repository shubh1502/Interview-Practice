import React from 'react'
import {faqs as faqsdata} from './data.js'
import { useState } from 'react'
import AccordionItem from './AccordionItem';

const Main = () => {
  // const [faqs, setFaqs] = useState(faqsdata);
  const [isOpened, setIsOpened] = useState(false);

  const containerStyle = {
    display: "flex",
    flexDirection: "row",
    width: "auto",
  border: "1px solid black",
  padding: "10px",
  overflow: "hidden",
  };
  
  const questionStyle = {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px",
    borderBottom: "1px solid black",
    cursor: "pointer",
  };
  
  const answerStyle = {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px",
    borderBottom: "1px solid black",
    backgroundColor: "#f0f0f0",
  };

  // const handleToggle = (id) => {
  //   console.log(faqsdata)
  //   setFaqs((prevFaqs) =>
  //     prevFaqs.map((faq) =>{
  //       console.log(faq);
  //       faq.id === id ? { ...faq, isOpened: !faq.isOpened } : { ...faq, isOpened: false }
  // })
  //   );
  // };

  const handleToggle = (id) =>{
    setIsOpened((prev)=> prev === id ? null : id)
  }

  return (
    <div>
      <h1>Faq's</h1>
      <div style={containerStyle}>
        <AccordionItem isOpened = {isOpened} questionStyle={questionStyle} answerStyle={answerStyle} handleToggle={handleToggle}/>
      </div>      
    </div>
  )
}

export default Main
