import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { categoryName: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.categoryName) {
    return NextResponse.json({ error: "categoryName is required" }, { status: 400 });
  }
  const existing = await prisma.category.findUnique({
    where: { categoryName: body.categoryName },
  });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }
  const category = await prisma.category.create({ data: { categoryName: body.categoryName } });
  return NextResponse.json(category, { status: 201 });
}
