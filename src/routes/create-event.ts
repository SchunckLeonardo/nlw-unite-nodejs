import { ZodTypeProvider } from "fastify-type-provider-zod";
import slugify from "slugify";
import z from "zod";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";

export async function createEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
    "/events",
    {
      schema: {
        body: z.object({
          title: z.string().min(4),
          details: z.string().nullable(),
          maximunAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, res) => {
      const { title, maximunAttendees, details } = req.body;

      const slug = slugify(title, { lower: true });

      try {
        const eventWithSameSlug = await prisma.event.findUnique({
          where: { slug },
        });

        if (eventWithSameSlug !== null) {
          throw new Error("Another event with same title already exists!");
        }

        const event = await prisma.event.create({
          data: {
            title,
            details,
            maximunAttendees,
            slug,
          },
        });

        return res.status(201).send({ eventId: event.id });
      } catch (err) {
        console.log(err);
      }
    }
  );
}
