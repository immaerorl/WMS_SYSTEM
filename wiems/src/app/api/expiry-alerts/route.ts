import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export function expiryStatus(expiryDate: Date): {
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "EXPIRED";
  daysLeft: number;
} {
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000);
  if (daysLeft < 0) return { status: "EXPIRED", daysLeft };
  if (daysLeft <= 30) return { status: "CRITICAL", daysLeft };
  if (daysLeft <= 90) return { status: "WARNING", daysLeft };
  return { status: "HEALTHY", daysLeft };
}

export async function GET() {
  const batches = await prisma.inventoryBatch.findMany({
    where: { quantity: { gt: 0 } },
    include: { item: { include: { category: true } } },
    orderBy: { expiryDate: "asc" },
  });

  const alerts = batches
    .filter((b) => b.expiryDate.getTime() - Date.now() < 90 * 86400000)
    .map((b) => ({
      batchId: b.id,
      sku: b.item.sku,
      itemName: b.item.itemName,
      category: b.item.category.categoryName,
      batchNo: b.batchNo,
      quantity: b.quantity,
      unitCost: b.unitCost,
      valueAtRisk: b.quantity * b.unitCost,
      expiryDate: b.expiryDate,
      ...expiryStatus(b.expiryDate),
    }));

  const summary = {
    warning: alerts.filter((a) => a.status === "WARNING").length,
    critical: alerts.filter((a) => a.status === "CRITICAL").length,
    expired: alerts.filter((a) => a.status === "EXPIRED").length,
    valueAtRisk: alerts.reduce((s, a) => s + a.valueAtRisk, 0),
  };

  return NextResponse.json({ summary, alerts });
}
