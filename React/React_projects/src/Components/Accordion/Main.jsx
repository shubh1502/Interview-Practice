import React from 'react'
import {faqs as faqsdata} from './data.js'
import { useState } from 'react'
import AccordionItem from './AccordionItem';

const Main = () => {
  const [faqs, setFaqs] = useState(faqsdata);
  const [isOpened, setIsOpened] = useState(false);

  const containerStyle = {
    display: "flex",
    flexDirection: "row",
    width: "300px",
  border: "1px solid black",
  padding: "10px",
  overflow: "hidden",
  };
  
  const questionStyle = {
    width: "100%",
    padding: "10px",
    borderBottom: "1px solid black",
    cursor: "pointer",
  };
  
  const answerStyle = {
    width: "100%",
    padding: "10px",
    borderBottom: "1px solid black",
    backgroundColor: "#f0f0f0",
  };

  const handleToggle = (id) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) =>
        faq.id === id ? { ...faq, isOpened: !faq.isOpened } : { ...faq, isOpened: false }
      )
    );
  };

  return (
    <div>
      <h1>Faq's</h1>
      <div style={containerStyle}>
        <AccordionItem faqs={faqs} questionStyle={questionStyle} answerStyle={answerStyle} handleToggle={handleToggle}/>
      </div>

      
    </div>
  )
}

export default Main
