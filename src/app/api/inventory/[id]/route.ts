import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PropagationMethod } from "@prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.inventory.findUnique({
    where: { id },
    include: { location: true, transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const {
    plantName, botanicalName, cultivar, containerSize,
    quantityAvailable, quantityReserved, quantitySold,
    locationId, propagationMethod, costPerUnit, retailPrice, wholesalePrice,
    category, lowStockThreshold, notes,
  } = body;

  const existing = await prisma.inventory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await prisma.inventory.update({
    where: { id },
    data: {
      plantName, botanicalName, cultivar, containerSize,
      quantityAvailable, quantityReserved, quantitySold,
      locationId: locationId || null,
      propagationMethod: (propagationMethod as PropagationMethod) || existing.propagationMethod,
      costPerUnit: costPerUnit ?? null,
      retailPrice: retailPrice ?? null,
      wholesalePrice: wholesalePrice ?? null,
      category, lowStockThreshold, notes,
    },
    include: { location: true },
  });

  // Log adjustment if quantity changed
  if (quantityAvailable !== undefined && quantityAvailable !== existing.quantityAvailable) {
    const diff = quantityAvailable - existing.quantityAvailable;
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: id,
        type: "ADJUST",
        quantity: Math.abs(diff),
        notes: `Quantity adjusted from ${existing.quantityAvailable} to ${quantityAvailable}`,
      },
    });
  }

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.inventory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
