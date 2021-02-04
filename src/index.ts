import polka from 'polka';
import bodyParser from 'body-parser';

import mediator from './mediators';

import { apiGet } from './mediators/pco';

import validateRequestBody from './middlewares/validateRequestBody';
import json from './middlewares/json';
import auth from './middlewares/auth';
import createSession from './controllers/createSession';

const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET;

polka()
  .use(json, bodyParser.json())
  .post('/session', validateRequestBody('new'), createSession) // make magic sign-in link
  .get('/requests', auth(SECRET), (req, res) => {
    res.json(req.user);
  })
  .put('/requests/:id', auth(SECRET), validateRequestBody('existing'), (req, res) => {}) // add coach/mentor to the workflow
  .get('/relationships', auth(SECRET), (req, res) => {})
  .post('/relationships', auth(SECRET), validateRequestBody('new'), (req, res) => {}) // create group
  .put('/relationships/:id/status', auth(SECRET), validateRequestBody('existing'), (req, res) => {}) // close group
  .get('/people', auth(SECRET), (req, res) => {})
  .get('/coaches', auth(SECRET), (req, res) => {})
  .get('/mentors', auth(SECRET), (req, res) => {})
  .listen(PORT, () => {
    mediator.provide('pco:api:get', apiGet);
    console.log(`⛪️ Starting Abbot on port ${PORT}`);
  });
