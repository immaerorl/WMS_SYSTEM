import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { poNumber, supplierId, sku, quantity, unitCost, batchNo, mfgDate, expiryDate, locationId } =
    body;

  if (!poNumber || !sku || !quantity || !batchNo || !expiryDate) {
    return NextResponse.json(
      { error: "poNumber, sku, quantity, batchNo and expiryDate are required" },
      { status: 400 }
    );
  }

  const item = await prisma.item.findUnique({ where: { sku } });
  if (!item) {
    return NextResponse.json({ error: `Unknown SKU: ${sku}` }, { status: 404 });
  }

  const batch = await prisma.inventoryBatch.create({
    data: {
      itemId: item.id,
      batchNo,
      quantity: Number(quantity),
      unitCost: unitCost ? Number(unitCost) : 0,
      mfgDate: mfgDate ? new Date(mfgDate) : null,
      expiryDate: new Date(expiryDate),
      locationId: locationId || null,
    },
  });

  await prisma.stockMovement.create({
    data: {
      itemId: item.id,
      movementType: "RECEIVING",
      quantity: Number(quantity),
      batchId: batch.id,
      referenceNumber: poNumber,
      createdBy: "system",
    },
  });

  if (poNumber) {
    await prisma.purchaseOrder.upsert({
      where: { poNumber },
      update: { status: "RECEIVED" },
      create: { poNumber, supplierId: supplierId || null, status: "RECEIVED" },
    });
  }

  return NextResponse.json(batch, { status: 201 });
}
