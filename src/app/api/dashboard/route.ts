import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalPlants,
    allInventory,
    locations,
    lowStockItems,
    recentTransactions,
    topInventory,
    insights,
  ] = await Promise.all([
    prisma.inventory.aggregate({ _sum: { quantityAvailable: true } }),
    prisma.inventory.findMany({ include: { location: true } }),
    prisma.location.findMany({ include: { _count: { select: { inventory: true } } } }),
    prisma.inventory.findMany({
      where: { quantityAvailable: { gt: 0 } },
      include: { location: true },
      orderBy: { quantityAvailable: "asc" },
      take: 10,
    }),
    prisma.inventoryTransaction.findMany({
      include: { inventory: true, fromLocation: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.inventory.findMany({
      include: { location: true },
      orderBy: { quantityAvailable: "desc" },
      take: 8,
    }),
    prisma.aiInsight.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Calculate total retail value
  const totalValue = allInventory.reduce((sum, item) => {
    const price = Number(item.retailPrice) || 0;
    return sum + price * item.quantityAvailable;
  }, 0);

  // Inventory by location
  const locationMap: Record<string, number> = {};
  for (const item of allInventory) {
    const loc = item.location?.name || "Unassigned";
    locationMap[loc] = (locationMap[loc] || 0) + item.quantityAvailable;
  }
  const inventoryByLocation = Object.entries(locationMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Value by category
  const categoryMap: Record<string, number> = {};
  for (const item of allInventory) {
    const cat = item.category || "Uncategorized";
    const val = Number(item.retailPrice || 0) * item.quantityAvailable;
    categoryMap[cat] = (categoryMap[cat] || 0) + val;
  }
  const valueByCategory = Object.entries(categoryMap)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // True low stock (below threshold)
  const actualLowStock = allInventory.filter(
    (item) => item.quantityAvailable <= item.lowStockThreshold && item.quantityAvailable > 0
  );

  return NextResponse.json({
    totalPlants: totalPlants._sum.quantityAvailable || 0,
    totalValue,
    lowStockCount: actualLowStock.length,
    locationsCount: locations.length,
    recentTransactions,
    topInventory,
    lowStockItems: actualLowStock.slice(0, 8),
    inventoryByLocation,
    valueByCategory,
    insights,
    categoryCounts: Object.keys(categoryMap).length,
  });
}
