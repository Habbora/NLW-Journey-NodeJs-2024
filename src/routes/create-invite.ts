import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mails";
import nodemailer from 'nodemailer'
import { env } from "../env";

export async function createInvites(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                email: z.string().email()
            }),
        }
    }, async (request) => {
        const { tripId } = request.params
        const { email } = request.body

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            }
        })

        if (!trip) { throw new ClientError('Trip not found') }

        const participant = await prisma.participant.create({
            data: {
                email: email,
                trip_id: trip.id
            }
        })
        
        const formattedStartDate = dayjs(trip.starts_at).format('LL')
        const formattedEndDate = dayjs(trip.ends_at).format('LL')

        const mail = await getMailClient()

        const comfirmationLink = `${env.WEB_BASE_URL}/participants/${participant.id}/confirm`

        const message = await mail.sendMail({
            from: {
                name: 'Equipe Alisson',
                address: 'admin@habbora.com.br',
            },
            to: participant.email,
            subject: 'Confirmação de Convite de Viagem',
                html: `
                <div>
                    <p>Você foi convidado para um grupo de viagem para 
                    <strong>${trip.destination}</strong>, 
                    partindo no dia <strong>${formattedStartDate}</strong> 
                    até o dia <strong>${formattedEndDate}</strong></p>
                    <p></p>
                    <p><a href="${comfirmationLink}">Confirmar sua viagem aqui</a></p>
                    <p></p>
                    <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
                </div>
            `.trim()
        })

        console.log(nodemailer.getTestMessageUrl(message))

        return { participant }
    })
}