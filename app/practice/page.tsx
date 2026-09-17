"use client";

import { use, useEffect, useState } from "react";

export default function Practice () {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  
  useEffect(()=> {
    setMessage(`カウントは ${count} になりました`);
  }, [count]);

  return (
    <div>
      <p>今のカウント：{count}</p>
      <p>お知らせ： {message}</p>
      <button onClick={() => setCount(count + 1)}>+1する</button>
    </div>
  );
}