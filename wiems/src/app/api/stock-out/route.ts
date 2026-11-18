import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sku, quantity, requestor, department, remarks } = body;

  if (!sku || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "sku and positive quantity are required" }, { status: 400 });
  }

  const item = await prisma.item.findUnique({
    where: { sku },
    include: {
      batches: {
        where: { quantity: { gt: 0 } },
        orderBy: { expiryDate: "asc" },
      },
    },
  });
  if (!item) {
    return NextResponse.json({ error: `Unknown SKU: ${sku}` }, { status: 404 });
  }

  let remaining = Number(quantity);
  const totalAvailable = item.batches.reduce((s, b) => s + b.quantity, 0);
  if (remaining > totalAvailable) {
    return NextResponse.json(
      { error: `Insufficient stock. Available: ${totalAvailable}` },
      { status: 400 }
    );
  }

  // FEFO: issue from nearest-expiry batches first
  for (const batch of item.batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.quantity, remaining);
    await prisma.inventoryBatch.update({
      where: { id: batch.id },
      data: { quantity: batch.quantity - take },
    });
    remaining -= take;
  }

  await prisma.stockMovement.create({
    data: {
      itemId: item.id,
      movementType: "ISSUE",
      quantity: Number(quantity),
      referenceNumber: null,
      requestor: requestor || null,
      department: department || null,
      remarks: remarks || null,
      createdBy: "system",
    },
  });

  return NextResponse.json({ ok: true, issued: Number(quantity) }, { status: 201 });
}
