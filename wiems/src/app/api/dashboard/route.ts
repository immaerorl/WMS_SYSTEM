import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expiryStatus } from "../expiry-alerts/route";

export async function GET() {
  const [items, batches, movements] = await Promise.all([
    prisma.item.findMany({ include: { batches: true, category: true } }),
    prisma.inventoryBatch.findMany({ where: { quantity: { gt: 0 } } }),
    prisma.stockMovement.findMany({
      include: { item: { select: { sku: true, itemName: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totalSkus = items.length;
  const totalUnits = batches.reduce((s, b) => s + b.quantity, 0);
  const inventoryValue = batches.reduce((s, b) => s + b.quantity * b.unitCost, 0);

  const expiry = { HEALTHY: 0, WARNING: 0, CRITICAL: 0, EXPIRED: 0 };
  for (const b of batches) {
    expiry[expiryStatus(b.expiryDate).status]++;
  }

  return NextResponse.json({
    inventory: { totalSkus, totalUnits, inventoryValue },
    expiry,
    recentMovements: movements,
  });
}
