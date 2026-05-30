import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { InsightType, Severity } from "@prisma/client";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { agentType } = await req.json();

  const inventory = await prisma.inventory.findMany({
    include: { location: true },
    orderBy: { updatedAt: "desc" },
  });

  const locations = await prisma.location.findMany({
    include: { _count: { select: { inventory: true } } },
  });

  const inventorySummary = inventory.slice(0, 80).map((i) => ({
    name: `${i.plantName}${i.cultivar ? ` ${i.cultivar}` : ""} (${i.containerSize || "?"})`,
    available: i.quantityAvailable,
    reserved: i.quantityReserved,
    sold: i.quantitySold,
    location: i.location?.name || "Unassigned",
    threshold: i.lowStockThreshold,
    category: i.category,
    retailPrice: i.retailPrice,
    notes: i.notes,
  }));

  const locationSummary = locations.map((l) => ({
    name: l.name,
    type: l.type,
    inventoryCount: l._count.inventory,
  }));

  type AgentConfig = {
    systemPrompt: string;
    userPrompt: string;
    insightType: InsightType;
  };

  const agentConfigs: Record<string, AgentConfig> = {
    INVENTORY_ANALYST: {
      systemPrompt: `You are an expert nursery inventory analyst. Analyze inventory data and provide 3-5 specific, actionable insights. Focus on: low stock alerts, excess inventory, discrepancies, and adjustment recommendations. Be specific with plant names and numbers. Format each insight with a title and body. Respond as JSON array with objects: {title, body, severity} where severity is CRITICAL, WARNING, or INFO.`,
      userPrompt: `Analyze this nursery inventory:\n\nInventory (${inventory.length} items):\n${JSON.stringify(inventorySummary, null, 2)}\n\nLocations:\n${JSON.stringify(locationSummary, null, 2)}\n\nProvide 4-5 specific inventory analysis insights as a JSON array.`,
      insightType: InsightType.INVENTORY_ANALYST,
    },
    PRODUCTION_PLANNER: {
      systemPrompt: `You are a nursery production planning expert. Analyze inventory to recommend propagation priorities and production scheduling. Consider sell-through rates, stock levels, lead times. Respond as JSON array with objects: {title, body, severity} where severity is CRITICAL, WARNING, or INFO.`,
      userPrompt: `Based on this nursery inventory data, provide production planning recommendations:\n\nInventory:\n${JSON.stringify(inventorySummary, null, 2)}\n\nProvide 4-5 production planning insights as a JSON array.`,
      insightType: InsightType.PRODUCTION_PLANNER,
    },
    OPERATIONS_ADVISOR: {
      systemPrompt: `You are a nursery operations consultant. Analyze inventory distribution, location efficiency, and operational patterns. Provide a weekly management summary and specific operational recommendations. Respond as JSON array with objects: {title, body, severity} where severity is CRITICAL, WARNING, or INFO.`,
      userPrompt: `Review these nursery operations:\n\nInventory:\n${JSON.stringify(inventorySummary, null, 2)}\n\nLocations:\n${JSON.stringify(locationSummary, null, 2)}\n\nProvide 4-5 operational insights and recommendations as a JSON array.`,
      insightType: InsightType.OPERATIONS_ADVISOR,
    },
  };

  const config = agentConfigs[agentType];
  if (!config) {
    return NextResponse.json({ error: "Invalid agent type" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
    // Return mock insights if no API key
    const mockInsights = [
      { title: "Configure API Key for AI Insights", body: "Add your ANTHROPIC_API_KEY to .env.local to enable AI-powered analysis. The AI agents will then analyze your inventory and provide specific, actionable recommendations.", severity: "INFO" },
    ];
    const saved = await Promise.all(mockInsights.map((insight) =>
      prisma.aiInsight.create({
        data: { type: config.insightType, title: insight.title, body: insight.body, severity: insight.severity as Severity },
      })
    ));
    return NextResponse.json({ insights: saved });
  }

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2000,
    system: config.systemPrompt,
    messages: [{ role: "user", content: config.userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
  }

  // Extract JSON from response
  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
  }

  const insights = JSON.parse(jsonMatch[0]);

  // Delete old insights of this type and save new ones
  await prisma.aiInsight.deleteMany({ where: { type: config.insightType } });
  const saved = await Promise.all(
    insights.map((insight: { title: string; body: string; severity: string }) =>
      prisma.aiInsight.create({
        data: {
          type: config.insightType,
          title: insight.title,
          body: insight.body,
          severity: (insight.severity as Severity) || "INFO",
        },
      })
    )
  );

  return NextResponse.json({ insights: saved });
}

export async function GET() {
  const insights = await prisma.aiInsight.findMany({
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(insights);
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const insight = await prisma.aiInsight.update({
    where: { id },
    data: { isRead: true },
  });
  return NextResponse.json(insight);
}
