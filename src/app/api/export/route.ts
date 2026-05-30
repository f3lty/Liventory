import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "inventory";

  let rows: string[] = [];

  if (type === "inventory") {
    const items = await prisma.inventory.findMany({
      include: { location: true },
      orderBy: { plantName: "asc" },
    });

    rows = [
      "Plant Name,Botanical Name,Cultivar,Container Size,Qty Available,Qty Reserved,Qty Sold,Location,Propagation Method,Cost Per Unit,Retail Price,Wholesale Price,Category,Low Stock Threshold,Notes,Date Added,Last Updated",
      ...items.map((i) =>
        [
          csv(i.plantName), csv(i.botanicalName), csv(i.cultivar), csv(i.containerSize),
          i.quantityAvailable, i.quantityReserved, i.quantitySold,
          csv(i.location?.name), csv(i.propagationMethod),
          i.costPerUnit, i.retailPrice, i.wholesalePrice,
          csv(i.category), i.lowStockThreshold, csv(i.notes),
          i.dateAdded.toISOString().split("T")[0],
          i.updatedAt.toISOString().split("T")[0],
        ].join(",")
      ),
    ];
  } else if (type === "transactions") {
    const txs = await prisma.inventoryTransaction.findMany({
      include: { inventory: true, fromLocation: true },
      orderBy: { createdAt: "desc" },
    });

    rows = [
      "Date,Plant Name,Transaction Type,Quantity,From Location,Notes",
      ...txs.map((t) =>
        [
          t.createdAt.toISOString().split("T")[0],
          csv(t.inventory.plantName), csv(t.type), t.quantity,
          csv(t.fromLocation?.name), csv(t.notes),
        ].join(",")
      ),
    ];
  } else if (type === "locations") {
    const locs = await prisma.location.findMany({
      include: { _count: { select: { inventory: true } } },
    });
    rows = [
      "Name,Description,Type,Inventory Count",
      ...locs.map((l) => [csv(l.name), csv(l.description), csv(l.type), l._count.inventory].join(",")),
    ];
  }

  const csvContent = rows.join("\n");
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="liventory-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function csv(val: string | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
