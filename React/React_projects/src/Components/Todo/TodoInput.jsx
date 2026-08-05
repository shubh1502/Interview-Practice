import React from 'react'

const TodoInput = ({input, handleInput, handleAddTask}) => {
  return (
    <div>
      <input type="text" placeholder="Enter your task" value={input} onChange={handleInput} />
      <button onClick={handleAddTask}>Add Task</button>
    </div>
  )
}

export default TodoInput
