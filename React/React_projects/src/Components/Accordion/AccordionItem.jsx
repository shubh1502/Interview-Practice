import React from 'react'

const AccordionItem = ({ faqs, questionStyle, answerStyle, handleToggle }) => {
  return (
    <div>
      {faqs.map((faq) => (
        <div key={faq.id}>
          <div style={questionStyle} onClick={() => handleToggle(faq.id)}>
            <span>{faq.question}</span>
            <span>{faq.isOpened ? '-' : '+'}</span>
          </div>
            {faq.isOpened && <div style={answerStyle}>{faq.answer}</div>}
        </div>
      ))}
    </div>
  )
}
export default AccordionItem
