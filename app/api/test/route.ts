import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const test = await prisma.test.create({
    data: { name: "Prisma works 🎉" },
  });

  return Response.json(test);
}