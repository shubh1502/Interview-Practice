import React from 'react'
import { faqs } from './data'

const AccordionItem = ({ isOpened, questionStyle, answerStyle, handleToggle }) => {
  return (
    <div>
      {faqs.map((faq) => (
        <div key={faq.id}>
          <div style={questionStyle} onClick={() => handleToggle(faq.id)}>
            <span>{faq.question}</span>
            <span>{isOpened ? '-' : '+' }</span>
          </div>
            {isOpened === faq.id && <div style={answerStyle}>{faq.answer}</div>}
        </div>
      ))}
    </div>
  )
}
export default AccordionItem
