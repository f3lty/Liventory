import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDemoData, deleteDemoData } from "@/lib/demo-seed";

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  if (action === "load") {
    const existing = await prisma.inventory.count({ where: { isDemo: true } });
    if (existing > 0) {
      return NextResponse.json({ error: "Demo data already loaded. Delete it first." }, { status: 409 });
    }
    await seedDemoData();
    return NextResponse.json({ success: true, message: "Demo data loaded successfully" });
  }

  if (action === "delete") {
    await deleteDemoData();
    return NextResponse.json({ success: true, message: "Demo data deleted successfully" });
  }

  if (action === "reset") {
    await deleteDemoData();
    await seedDemoData();
    return NextResponse.json({ success: true, message: "Demo environment reset successfully" });
  }

  if (action === "status") {
    const [inventoryCount, locationCount] = await Promise.all([
      prisma.inventory.count({ where: { isDemo: true } }),
      prisma.location.count({ where: { isDemo: true } }),
    ]);
    return NextResponse.json({ inventoryCount, locationCount, hasDemo: inventoryCount > 0 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
