import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { rows, mapping } = await req.json();

  if (!rows || !Array.isArray(rows)) {
    return NextResponse.json({ error: "rows array required" }, { status: 400 });
  }

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  // Get all locations for name lookup
  const locations = await prisma.location.findMany();
  const locationMap = new Map(locations.map((l) => [l.name.toLowerCase(), l.id]));

  for (const row of rows) {
    try {
      const plantName = row[mapping.plantName];
      if (!plantName) { results.skipped++; continue; }

      let locationId: string | null = null;
      const locationName = row[mapping.location];
      if (locationName) {
        let locId = locationMap.get(locationName.toLowerCase());
        if (!locId) {
          const newLoc = await prisma.location.create({
            data: { name: locationName, type: "OTHER" },
          });
          locId = newLoc.id;
          locationMap.set(locationName.toLowerCase(), locId);
        }
        locationId = locId;
      }

      const parseNum = (key: string) => {
        if (!mapping[key] || !row[mapping[key]]) return null;
        const n = parseFloat(String(row[mapping[key]]).replace(/[$,]/g, ""));
        return isNaN(n) ? null : n;
      };
      const parseInt2 = (key: string, def = 0) => {
        if (!mapping[key] || !row[mapping[key]]) return def;
        const n = parseInt(String(row[mapping[key]]).replace(/[^0-9-]/g, ""));
        return isNaN(n) ? def : n;
      };

      await prisma.inventory.create({
        data: {
          plantName: String(plantName).trim(),
          botanicalName: mapping.botanicalName ? row[mapping.botanicalName] || null : null,
          cultivar: mapping.cultivar ? row[mapping.cultivar] || null : null,
          containerSize: mapping.containerSize ? row[mapping.containerSize] || null : null,
          quantityAvailable: parseInt2("quantityAvailable"),
          quantityReserved: parseInt2("quantityReserved"),
          quantitySold: parseInt2("quantitySold"),
          locationId,
          costPerUnit: parseNum("costPerUnit"),
          retailPrice: parseNum("retailPrice"),
          wholesalePrice: parseNum("wholesalePrice"),
          category: mapping.category ? row[mapping.category] || null : null,
          notes: mapping.notes ? row[mapping.notes] || null : null,
        },
      });
      results.imported++;
    } catch (err) {
      results.errors.push(`Row error: ${err instanceof Error ? err.message : "unknown"}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
