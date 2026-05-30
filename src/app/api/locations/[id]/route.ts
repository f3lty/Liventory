import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LocationType } from "@prisma/client";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, description, type } = await req.json();
  try {
    const location = await prisma.location.update({
      where: { id },
      data: { name, description, type: type as LocationType },
    });
    return NextResponse.json(location);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.location.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
