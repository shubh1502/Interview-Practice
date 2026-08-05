import React from 'react'

const TodoList = ({todos, handleDone, handleDelete}) => {
  return (
    <div>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{todo.task}</span>
                <div>
                    <span style={{display: "flex", flexDirection: "row", marginLeft: "10px"}}>{todo.done ? "Done" : "Not Done"}</span>
                    <button onClick={() => handleDone(todo.id)}>{todo.done ? "Undo" : "Done"}</button>
                    <button onClick={() => handleDelete(todo.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      
    </div>
  )
}

export default TodoList
