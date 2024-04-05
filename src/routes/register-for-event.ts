import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number().int(),
          }),
        },
      },
    },
    async (req, res) => {
      const { eventId } = req.params;
      const { name, email } = req.body;

      const attendeeFromEmail = await prisma.attendee.findUnique({
        where: {
          eventId_email: {
            email,
            eventId,
          },
        },
      });

      if (attendeeFromEmail !== null) {
        throw new Error("This e-mail is already registered in this event");
      }

      const [event, amountOfAttendeesForEvent] = await Promise.all([
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),

        prisma.attendee.count({
          where: {
            eventId,
          },
        }),
      ]);

      if (
        event?.maximunAttendees &&
        amountOfAttendeesForEvent >= event?.maximunAttendees
      ) {
        throw new Error(
          "The maximun number of attendees for this event has been reached!"
        );
      }

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      });

      return res.status(201).send({ attendeeId: attendee.id });
    }
  );
}
