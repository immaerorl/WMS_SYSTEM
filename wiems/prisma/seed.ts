import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);

async function main() {
  // Roles
  for (const name of ["Administrator", "Warehouse Supervisor", "Warehouse Staff", "Viewer"]) {
    await prisma.role.upsert({ where: { roleName: name }, update: {}, create: { roleName: name } });
  }
  const adminRole = await prisma.role.findUnique({ where: { roleName: "Administrator" } });
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", email: "admin@wiems.local", roleId: adminRole!.id },
  });

  // Categories
  const categoryNames = ["First Aid", "Disposable", "PPE", "Medical Devices", "Consumables", "Chemicals", "Office Supplies"];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const c = await prisma.category.upsert({
      where: { categoryName: name },
      update: {},
      create: { categoryName: name },
    });
    categories[name] = c.id;
  }

  // Location
  const location = await prisma.location.upsert({
    where: { id: "seed-loc-a" },
    update: {},
    create: { id: "seed-loc-a", warehouse: "Warehouse A", zone: "Zone B", rack: "Rack 03", shelf: "Shelf A2" },
  });

  // Items + batches with varied expiry dates
  const items = [
    { sku: "GZ001", name: "Sterile Gauze 10x10", cat: "First Aid", exp: 100 },
    { sku: "GZ001B", name: "Sterile Gauze 10x10 (Bulk)", cat: "First Aid", exp: 15 },
    { sku: "MSK001", name: "Surgical Mask 3-ply", cat: "PPE", exp: 60 },
    { sku: "GLV001", name: "Nitrile Gloves M", cat: "PPE", exp: 400 },
    { sku: "SYR005", name: "Syringe 5ml", cat: "Medical Devices", exp: -10 },
    { sku: "ALC500", name: "Alcohol Swabs 500pk", cat: "Consumables", exp: 85 },
    { sku: "TAP001", name: "Medical Tape 1in", cat: "First Aid", exp: 200 },
  ];

  for (const it of items) {
    const item = await prisma.item.upsert({
      where: { sku: it.sku },
      update: {},
      create: {
        sku: it.sku,
        itemName: it.name,
        categoryId: categories[it.cat],
        barcode: `BC${it.sku}`,
      },
    });
    const existingBatch = await prisma.inventoryBatch.findFirst({ where: { itemId: item.id } });
    if (!existingBatch) {
      await prisma.inventoryBatch.create({
        data: {
          itemId: item.id,
          batchNo: `B2026-${it.sku}`,
          quantity: 500,
          unitCost: 1.25,
          expiryDate: daysFromNow(it.exp),
          locationId: location.id,
        },
      });
    }
  }

  const po = await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-2026-001" },
    update: {},
    create: { poNumber: "PO-2026-001", status: "OPEN" },
  });

  console.log("Seed complete:", { items: items.length, po: po.poNumber });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
