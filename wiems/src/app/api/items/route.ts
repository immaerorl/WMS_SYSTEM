import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  const items = await prisma.item.findMany({
    where: keyword
      ? {
          OR: [
            { sku: { contains: keyword } },
            { itemName: { contains: keyword } },
            { barcode: keyword },
          ],
        }
      : undefined,
    include: {
      category: true,
      batches: true,
    },
  });

  const result = items.map((item) => {
    const totalQty = item.batches.reduce((s, b) => s + b.quantity, 0);
    const totalValue = item.batches.reduce((s, b) => s + b.quantity * b.unitCost, 0);
    const nearestExpiry = item.batches
      .filter((b) => b.quantity > 0)
      .map((b) => b.expiryDate)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return {
      ...item,
      totalQuantity: totalQty,
      totalValue,
      nearestExpiry: nearestExpiry ?? null,
    };
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sku, itemName, categoryId, barcode } = body;
  if (!sku || !itemName || !categoryId) {
    return NextResponse.json(
      { error: "sku, itemName and categoryId are required" },
      { status: 400 }
    );
  }
  const existing = await prisma.item.findUnique({ where: { sku } });
  if (existing) {
    return NextResponse.json(
      { error: `SKU ${sku} already exists. One SKU = One Item.` },
      { status: 409 }
    );
  }
  const item = await prisma.item.create({
    data: { sku, itemName, categoryId, barcode: barcode || null },
  });
  return NextResponse.json(item, { status: 201 });
}
