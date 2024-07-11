import type { FastifyInstance } from "fastify"

type FastifyClientErrorHandler = FastifyInstance['errorHandler']

export const ClientErrorHandler: FastifyClientErrorHandler = (ClientError, request, response) => {
    console.log(ClientError)

    return response.status(500).send({ message: 'Internal Server ClientError'})
}