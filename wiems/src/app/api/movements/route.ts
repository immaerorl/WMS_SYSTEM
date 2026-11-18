import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const movements = await prisma.stockMovement.findMany({
    include: { item: { select: { sku: true, itemName: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(movements);
}

// Adjustments require Supervisor/Admin authorization in the full RBAC design;
// the demo endpoint records an ADJUSTMENT movement and applies delta to a batch.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { batchId, newQuantity, remarks } = body;
  if (!batchId || newQuantity === undefined || newQuantity < 0) {
    return NextResponse.json({ error: "batchId and non-negative newQuantity required" }, { status: 400 });
  }
  const batch = await prisma.inventoryBatch.findUnique({ where: { id: batchId } });
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const delta = Number(newQuantity) - batch.quantity;
  await prisma.inventoryBatch.update({
    where: { id: batchId },
    data: { quantity: Number(newQuantity) },
  });
  await prisma.stockMovement.create({
    data: {
      itemId: batch.itemId,
      movementType: "ADJUSTMENT",
      quantity: delta,
      batchId,
      remarks: remarks || null,
      createdBy: "system",
    },
  });
  return NextResponse.json({ ok: true, delta }, { status: 201 });
}
