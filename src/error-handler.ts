import type { FastifyInstance } from "fastify"
import { ClientError } from "./errors/client-error"
import { ZodError } from "zod"

type FastifyClientErrorHandler = FastifyInstance['errorHandler']

export const ClientErrorHandler: FastifyClientErrorHandler = (error, request, response) => {
    console.log(ClientError)

    if (error instanceof ZodError) {
        return response.status(400).send({
            message: 'Invalid Input',
            errors: error.flatten().fieldErrors
        })
    }

    if (error instanceof ClientError) {
        return response.status(400).send({
            message: error.message
        })
    }

    return response.status(500).send({ message: 'Internal Server ClientError'})
}