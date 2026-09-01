"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  ListTodosResponse,
  TodoDto,
} from "@/app/api/todos/route";
import type {
  DeleteTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
} from "@/app/api/todos/[id]/route";

const PRIORITY_LABELS: Record<number, string> = { 1: "低", 2: "中", 3: "高" };

function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dueDate));
}

function priorityBadgeClass(priority: number) {
  if (priority >= 3) {
    return "rounded-full bg-red-500/10 px-2 py-0.5 text-red-600 dark:text-red-400";
  }
  if (priority === 2) {
    return "rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400";
  }
  return "rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-600 dark:text-blue-400";
}

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [todos, setTodos] = useState<TodoDto[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    if (!res.ok) {
      setError("TODO の取得に失敗しました");
      return;
    }
    const data: ListTodosResponse = await res.json();
    setTodos(data.todos);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? "");
      await loadTodos();
      setLoading(false);
    }

    init();
  }, [router, loadTodos]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setError(null);
    const requestBody: CreateTodoRequest = {
      title,
      dueDate: newDueDate
        ? new Date(`${newDueDate}T00:00:00`).toISOString()
        : null,
      priority: newPriority ? Number(newPriority) : null,
    };
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      setError("TODO の追加に失敗しました");
      return;
    }

    const data: CreateTodoResponse = await res.json();
    setTodos((prev) => [data.todo, ...prev]);
    setNewTitle("");
    setNewDueDate("");
    setNewPriority("");
  }

  async function handleToggle(todo: TodoDto) {
    setError(null);
    const requestBody: UpdateTodoRequest = { isCompleted: !todo.isCompleted };
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      setError("TODO の更新に失敗しました");
      return;
    }

    const data: UpdateTodoResponse = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? data.todo : t)));
  }

  async function handleDelete(todo: TodoDto) {
    setError(null);
    const res = await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });

    if (!res.ok) {
      setError("TODO の削除に失敗しました");
      return;
    }

    const data: DeleteTodoResponse = await res.json();
    if (data.success) {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          読み込み中…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between gap-4 border-b border-black/[.08] px-4 py-4 dark:border-white/[.145] sm:px-8">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          My TODO App
        </h1>
        <div className="flex min-w-0 items-center gap-3">
          <span className="max-w-[40vw] truncate text-sm text-zinc-600 dark:text-zinc-400 sm:max-w-none">
            {userEmail}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-full border border-black/[.08] px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="flex justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-900 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="mb-6 flex flex-col gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="新しい TODO を入力"
              className="w-full rounded-lg border border-black/[.08] bg-white px-3 py-2 text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-lg border border-black/[.08] bg-white px-3 py-2 text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="shrink-0 rounded-lg border border-black/[.08] bg-white px-3 py-2 text-black outline-none focus:border-zinc-950 dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
              >
                <option value="">優先度なし</option>
                <option value="1">低</option>
                <option value="2">中</option>
                <option value="3">高</option>
              </select>
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-foreground px-5 py-2 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              追加
            </button>
          </form>

          {todos.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              TODO はまだありません。
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 rounded-lg border border-black/[.08] px-3 py-2 dark:border-white/[.1]"
                >
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => handleToggle(todo)}
                    className="h-4 w-4 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={
                        todo.isCompleted
                          ? "block break-words text-sm text-zinc-400 line-through dark:text-zinc-600"
                          : "block break-words text-sm text-black dark:text-zinc-50"
                      }
                    >
                      {todo.title}
                    </span>
                    {(todo.dueDate || todo.priority) && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {todo.dueDate && (
                          <span>期限: {formatDueDate(todo.dueDate)}</span>
                        )}
                        {todo.priority && (
                          <span className={priorityBadgeClass(todo.priority)}>
                            {PRIORITY_LABELS[todo.priority] ??
                              `優先度 ${todo.priority}`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(todo)}
                    className="shrink-0 text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
