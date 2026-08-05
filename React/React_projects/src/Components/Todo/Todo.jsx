import React from "react";
import { useState } from "react";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";

const Todo = () => {
  const [input, setInput] = useState("");
  const [todos, setTodos] = useState([]);

  const handleAddTask = (e) => {
    console.log(e.target.value);
    if(e.target.value.trim() === "" || e.target.value === null){
      alert("Please enter a task");
      return;
    }
    const newtodo = { id: Date.now(), task: input, done: false };
    setTodos(prev => [...prev, newtodo]);
    setInput("");
  };

  const handleInput = (e) => {     
    setInput(e.target.value);
  }
  
  const handleDone = (id) => {
    const updatedTodo = todos.map((todo)=>{
      if(todo.id == id){
        return {...todo, done: !todo.done}
      }
      return todo;
    })
    setTodos(updatedTodo);
  }

  const handleDelete = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  }
    

  return (
    <div>
      <TodoInput input={input} handleInput={handleInput} handleAddTask={handleAddTask}/>
      {todos.length > 0 && 
        <TodoList todos={todos} handleDone={handleDone} handleDelete={handleDelete}/>
      }
    </div>
  );
};

export default Todo;
