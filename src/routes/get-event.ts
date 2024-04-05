import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId",
    {
      schema: {
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          200: {
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              details: z.string().nullable(),
              slug: z.string(),
              maximunAttendees: z.number().int().nullable(),
              attendeesAmount: z.number().int(),
            }),
          },
        },
      },
    },
    async (req, res) => {
      const { eventId } = req.params;

      const event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximunAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        where: {
          id: eventId,
        },
      });

      if (event === null) {
        throw new Error("Event not found.");
      }

      return res.status(200).send({
        event: {
          id: event.id,
          title: event.title,
          details: event.details,
          slug: event.slug,
          maximunAttendees: event.maximunAttendees,
          attendeesAmount: event._count.attendees,
        },
      });
    }
  );
}
