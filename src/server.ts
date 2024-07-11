import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { createTrips } from './routes/create-trips';
import { confirmTrip } from './routes/confirm-trip';
import { ConfirmParticipant } from './routes/confirm-participant';
import { createActivity } from './routes/create-activity';
import { getActivities } from './routes/get-activities';
import { createLink } from './routes/creates-link';
import { getLinks } from './routes/get-links';
import { getTrip } from './routes/get-trips';
import { getParticipants } from './routes/get-participants';
import { createInvites } from './routes/create-invite';
import { env } from './env';

const app = fastify()

app.register(fastifyCors, {
    origin: '*',
})

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrips)
app.register(getTrip)
app.register(confirmTrip)
app.register(getParticipants)
app.register(ConfirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(createInvites)

app.listen({port: env.PORT}).then(() => {
    console.log('Server running');
})