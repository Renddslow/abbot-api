import polka from 'polka';
import bodyParser from 'body-parser';
import cors from 'cors';

import mediator from './mediators';

import { apiGet, apiPost } from './mediators/pco';

import validateRequestBody from './middlewares/validateRequestBody';
import json from './middlewares/json';
import auth from './middlewares/auth';
import createSession from './controllers/createSession';
import getCoaches from './controllers/getCoaches';
import getMentors from './controllers/getMentors';
import getPeople from './controllers/getPeople';
import getPerson from './controllers/getPerson';
import getRelationships from './controllers/getRelationships';
import getRelationship from './controllers/getRelationship';
import getRequests from './controllers/getRequests';
import getRequest from './controllers/getRequest';
import updateAssignment from './controllers/updateAssignment';
import createRelationship from './controllers/createRelationship';
import deleteRequest from './controllers/deleteRequest';
import email from './mediators/email';

const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET;

// TODO: security

polka()
  .use(json, bodyParser.json(), cors())
  .post('/session', validateRequestBody('new'), createSession) // TODO: send email

  /** Relationships */
  .get('/requests', auth(SECRET), getRequests)
  .get('/requests/:id', auth(SECRET), getRequest)
  .patch(
    '/requests/:id/assignment',
    auth(SECRET),
    validateRequestBody('existing'),
    updateAssignment,
  )
  .delete('/requests/:id', auth(SECRET), deleteRequest)

  /** Relationships */
  .get('/relationships', auth(SECRET), getRelationships)
  .get('/relationships/:id', auth(SECRET), getRelationship)
  .post('/relationships', auth(SECRET), validateRequestBody('new'), createRelationship)
  .patch(
    '/relationships/:id/archived',
    auth(SECRET),
    validateRequestBody('existing'),
    (req, res) => {},
  ) // TODO: close group

  /** People */
  .get('/people', auth(SECRET), getPeople)
  .get('/people/:id', auth(SECRET), getPerson)
  .get('/coaches', auth(SECRET), getCoaches)
  .get('/mentors', auth(SECRET), getMentors)
  .listen(PORT, () => {
    mediator.provide('pco:api:get', apiGet);
    mediator.provide('pco:api:post', apiPost);
    mediator.provide('email', email);
    console.log(`⛪️ Starting Abbot on port ${PORT}`);
  });
