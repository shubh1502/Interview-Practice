import React, {useState} from 'react'
import Modal from './Modal'


const Main = () => {

    const [isOpen, setIsOpen] = useState(false)

    const closeModal = ()=>{
        setIsOpen(!isOpen)
    }

    const handleModal = () =>{
        setIsOpen(true)
    }
  return (
    <div>
      <h2>Hi welcome to my page</h2>
      <button onClick = {handleModal}>Open Modal</button>
      {isOpen && <Modal onClose = {closeModal}/>}
    </div>
  )
}

export default Main
