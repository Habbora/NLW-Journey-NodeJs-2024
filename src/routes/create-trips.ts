import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mails";
import nodemailer from 'nodemailer'
import { env } from "../env";

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export async function createTrips(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email()),
            })
        }
    }, async (request) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body

        if (dayjs(starts_at).isBefore(new Date())) {
            throw new ClientError('Invalid trip start date')
        }

        if (dayjs(ends_at).isBefore(starts_at)) {
            throw new ClientError('Invalid trip end date')
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_owner: true,
                                is_confirmed: true
                            },
                            ...emails_to_invite.map(email => {
                                return { email }
                            })
                        ]
                        
                    }
                }
            }
        })

        const formattedStartDate = dayjs(starts_at).format('LL')
        const formattedEndDate = dayjs(ends_at).format('LL')

        const comfirmationLink = `${env.WEB_BASE_URL}/trips/${trip.id}/confirm`

        const mail = await getMailClient()

        const message = await mail.sendMail({
            from: {
                name: 'Equipe Alisson',
                address: 'admin@habbora.com.br',
            },
            to: {
                name: owner_name,
                address: owner_email
            },
            subject: 'Teste',
             html: `
                <div>
                    <p>Você solicitou um criação de viagem para 
                    <strong>${destination}</strong>, 
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

        return {
            tripId: trip.id
        }
    })
}