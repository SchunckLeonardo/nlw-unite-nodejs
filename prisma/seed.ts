import { prisma } from "../src/lib/prisma";

async function seed() {
  await prisma.event.create({
    data: {
      id: "e4de726c-3234-4ec1-855e-798e4410366d",
      title: "Unite Summit",
      slug: "unite-summit",
      details: "Um evento para devs apaixonados por códigos!",
      maximunAttendees: 120,
    },
  });
}

seed().then(() => {
  console.log("Database seeded!");
  prisma.$disconnect();
});
