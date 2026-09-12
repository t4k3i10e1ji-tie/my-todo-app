"use client";

function Greeting({ name }: { name: string }) {
  return <p>こんにちは、{name}さん！</p>;
}

export default function Practice() {
  return (
    <div>
      <Greeting name="たろう" />
      <Greeting name="はなこ" />
    </div>
  );
}