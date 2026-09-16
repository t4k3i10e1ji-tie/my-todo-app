"use client";

import { useState } from "react";

export default function Practice() {
  const [todos, setTodos] = useState([{ id: 1, title: "牛乳を買う"}]);

  const addTodo = () => {
    const nextId = todos.length + 1;
    setTodos([...todos,{ id: nextId, title: "新しいタスク"}]);
  };

  return (
    <div>
      <button onClick={addTodo}>タスクを追加</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}