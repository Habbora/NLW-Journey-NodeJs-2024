import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { createTrips } from './routes/create-trips';
import { confirmTrip } from './routes/confirm-trip';
import { ConfirmParticipant } from './routes/confirm-participant';
import { createActivity } from './routes/create-activity';
import { getActivities } from './routes/get-activities';
import { createLink } from './routes/create-link';
import { getLinks } from './routes/get-links';
import { getTrip } from './routes/get-trips';
import { getParticipants } from './routes/get-participants';
import { createInvites } from './routes/create-invite';
import { env } from './env';
import { updateTrip } from './routes/update-trip';
import { getTripDetails } from './routes/get-trip-details';
import { getParticipantDetails } from './routes/get-participant-details';

const app = fastify()

app.register(fastifyCors, {
    origin: '*',
})

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrips)
app.register(confirmTrip)
app.register(ConfirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(getParticipants)
app.register(createInvites)
app.register(updateTrip)
app.register(getTripDetails)
app.register(getParticipantDetails)

app.listen({port: env.PORT}).then(() => {
    console.log('Server running');
})