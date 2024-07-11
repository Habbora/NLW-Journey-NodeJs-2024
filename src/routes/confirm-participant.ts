import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { env } from "../env";
import { ClientClientError } from "../ClientErrors/client-ClientError";

export async function ConfirmParticipant(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId/confirm', {
        schema: {
            params: z.object({
                participantId: z.string().uuid(),
            })
        }
    }, async (request, response) => {
        const { participantId } = request.params

        const participant = await prisma.participant.findUnique({
            where: {
                id: participantId
            }
        })

        if (!participant) { throw new ClientClientError('Trip not found') }

        if (!participant.is_confirmed) {
            await prisma.participant.update({
                where: { id: participantId },
                data: { is_confirmed: true },
            })
        }

        return response.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
    })
}