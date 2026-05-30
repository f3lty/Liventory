import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PropagationMethod } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const category = searchParams.get("category") || "";
  const containerSize = searchParams.get("containerSize") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { plantName: { contains: search, mode: "insensitive" } },
      { botanicalName: { contains: search, mode: "insensitive" } },
      { cultivar: { contains: search, mode: "insensitive" } },
    ];
  }
  if (location) where.locationId = location;
  if (category) where.category = { contains: category, mode: "insensitive" };
  if (containerSize) where.containerSize = { contains: containerSize, mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: { location: true },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventory.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    plantName, botanicalName, cultivar, containerSize,
    quantityAvailable, quantityReserved, quantitySold,
    locationId, propagationMethod, costPerUnit, retailPrice, wholesalePrice,
    category, lowStockThreshold, notes,
  } = body;

  if (!plantName) {
    return NextResponse.json({ error: "plantName is required" }, { status: 400 });
  }

  const item = await prisma.inventory.create({
    data: {
      plantName, botanicalName, cultivar, containerSize,
      quantityAvailable: quantityAvailable ?? 0,
      quantityReserved: quantityReserved ?? 0,
      quantitySold: quantitySold ?? 0,
      locationId: locationId || null,
      propagationMethod: (propagationMethod as PropagationMethod) || "CUTTING",
      costPerUnit: costPerUnit ?? null,
      retailPrice: retailPrice ?? null,
      wholesalePrice: wholesalePrice ?? null,
      category, lowStockThreshold: lowStockThreshold ?? 10, notes,
    },
    include: { location: true },
  });

  // Log transaction
  if (quantityAvailable && quantityAvailable > 0) {
    await prisma.inventoryTransaction.create({
      data: { inventoryId: item.id, type: "ADD", quantity: quantityAvailable, notes: "Initial stock entry" },
    });
  }

  return NextResponse.json(item, { status: 201 });
}
