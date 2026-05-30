import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LocationType } from "@prisma/client";

export async function GET() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { inventory: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const { name, description, type } = await req.json();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  try {
    const location = await prisma.location.create({
      data: { name, description, type: (type as LocationType) || "OTHER" },
    });
    return NextResponse.json(location, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Location name must be unique" }, { status: 409 });
  }
}
