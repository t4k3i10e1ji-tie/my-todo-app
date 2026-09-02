import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/prisma/db";

export type TodoDto = {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  priority: number | null;
  createdAt: string;
};

export type ListTodosResponse = {
  todos: TodoDto[];
};

export type CreateTodoRequest = {
  title: string;
  dueDate?: string | null;
  priority?: number | null;
};

export type CreateTodoResponse = {
  todo: TodoDto;
};

export type ApiErrorResponse = {
  error: string;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const todos = await db.orm.public.Todo.where({ userId: user.id })
    .orderBy((t) => t.createdAt.desc())
    .all();

  const response: ListTodosResponse = {
    todos: todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      isCompleted: todo.isCompleted,
      dueDate: todo.dueDate,
      priority: todo.priority,
      createdAt: todo.createdAt,
    })),
  };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  let requestBody: CreateTodoRequest;
  try {
    requestBody = await request.json();
  } catch {
    const body: ApiErrorResponse = { error: "Invalid request body" };
    return NextResponse.json(body, { status: 400 });
  }

  const title = requestBody.title?.trim();
  if (!title) {
    const body: ApiErrorResponse = { error: "Title is required" };
    return NextResponse.json(body, { status: 400 });
  }

  if (
    requestBody.dueDate != null &&
    Number.isNaN(new Date(requestBody.dueDate).getTime())
  ) {
    const body: ApiErrorResponse = { error: "Invalid dueDate" };
    return NextResponse.json(body, { status: 400 });
  }

  if (
    requestBody.priority != null &&
    !Number.isInteger(requestBody.priority)
  ) {
    const body: ApiErrorResponse = { error: "Invalid priority" };
    return NextResponse.json(body, { status: 400 });
  }

  const todo = await db.orm.public.Todo.create({
    userId: user.id,
    title,
    dueDate: requestBody.dueDate ?? null,
    priority: requestBody.priority ?? null,
  });

  const response: CreateTodoResponse = {
    todo: {
      id: todo.id,
      title: todo.title,
      isCompleted: todo.isCompleted,
      dueDate: todo.dueDate,
      priority: todo.priority,
      createdAt: todo.createdAt,
    },
  };

  return NextResponse.json(response, { status: 201 });
}
