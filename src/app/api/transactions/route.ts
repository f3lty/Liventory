import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const inventoryId = searchParams.get("inventoryId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  const where = inventoryId ? { inventoryId } : {};

  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      include: {
        inventory: true,
        fromLocation: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { inventoryId, type, quantity, fromLocationId, notes } = await req.json();

  if (!inventoryId || !type || !quantity) {
    return NextResponse.json({ error: "inventoryId, type, and quantity are required" }, { status: 400 });
  }

  const item = await prisma.inventory.findUnique({ where: { id: inventoryId } });
  if (!item) return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });

  // Update inventory quantities based on transaction type
  let updateData: Record<string, number> = {};
  if (type === TransactionType.ADD) {
    updateData = { quantityAvailable: item.quantityAvailable + quantity };
  } else if (type === TransactionType.REMOVE) {
    updateData = { quantityAvailable: Math.max(0, item.quantityAvailable - quantity) };
  } else if (type === TransactionType.ADJUST) {
    updateData = { quantityAvailable: quantity };
  } else if (type === TransactionType.SALE) {
    updateData = {
      quantityAvailable: Math.max(0, item.quantityAvailable - quantity),
      quantitySold: item.quantitySold + quantity,
    };
  } else if (type === TransactionType.RESERVATION) {
    updateData = {
      quantityAvailable: Math.max(0, item.quantityAvailable - quantity),
      quantityReserved: item.quantityReserved + quantity,
    };
  }

  const [transaction] = await prisma.$transaction([
    prisma.inventoryTransaction.create({
      data: { inventoryId, type: type as TransactionType, quantity, fromLocationId: fromLocationId || null, notes },
      include: { inventory: true, fromLocation: true },
    }),
    prisma.inventory.update({ where: { id: inventoryId }, data: updateData }),
  ]);

  return NextResponse.json(transaction, { status: 201 });
}
