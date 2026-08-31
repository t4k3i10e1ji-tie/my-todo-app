import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/prisma/db";
import type { ApiErrorResponse, TodoDto } from "@/app/api/todos/route";

export type UpdateTodoRequest = {
  isCompleted: boolean;
};

export type UpdateTodoResponse = {
  todo: TodoDto;
};

export type DeleteTodoResponse = {
  success: true;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const { id } = await params;

  let requestBody: UpdateTodoRequest;
  try {
    requestBody = await request.json();
  } catch {
    const body: ApiErrorResponse = { error: "Invalid request body" };
    return NextResponse.json(body, { status: 400 });
  }

  const existing = await db.orm.public.Todo.first({ id });
  if (!existing || existing.userId !== user.id) {
    const body: ApiErrorResponse = { error: "Not found" };
    return NextResponse.json(body, { status: 404 });
  }

  await db.orm.public.Todo.where({ id: existing.id, userId: user.id }).update({
    isCompleted: requestBody.isCompleted,
  });

  const updated = await db.orm.public.Todo.first({ id });

  const response: UpdateTodoResponse = {
    todo: {
      id: updated!.id,
      title: updated!.title,
      isCompleted: updated!.isCompleted,
      createdAt: updated!.createdAt,
    },
  };

  return NextResponse.json(response);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const body: ApiErrorResponse = { error: "Unauthorized" };
    return NextResponse.json(body, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.orm.public.Todo.first({ id });
  if (!existing || existing.userId !== user.id) {
    const body: ApiErrorResponse = { error: "Not found" };
    return NextResponse.json(body, { status: 404 });
  }

  await db.orm.public.Todo.where({ id: existing.id, userId: user.id }).delete();

  const response: DeleteTodoResponse = { success: true };
  return NextResponse.json(response);
}
