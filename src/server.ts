import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import z from "zod";

const prisma = new PrismaClient({
  log: ["query"],
});

const app = fastify();

app.post("/events", async (req, res) => {
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximunAttendees: z.number().int().positive().nullable(),
  });

  const data = createEventSchema.parse(req.body);

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        details: data.details,
        maximunAttendees: data.maximunAttendees,
        slug: data.title.toLowerCase().replace(" ", "-"),
      },
    });

    return res.status(201).send({ eventId: event.id });
  } catch (err) {
    console.log(err);
  }
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running!");
});
