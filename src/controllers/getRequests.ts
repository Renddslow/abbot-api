import { get } from 'dot-prop';

import mediator from '../mediators';
import { parsePerson } from './getPerson';

const getAssignmentStatus = (note) => {
  if (!note) {
    return { status: 'unassigned', to: null };
  }

  const noteData = get(note, 'attributes.note', '');
  const [status, to] = noteData.split(': ');

  if (status && to) {
    return {
      status: status.toLowerCase().includes('pending') ? 'pending' : 'rejected',
      to,
    };
  }

  return { status: 'unassigned', to: null };
};

export const parseCardData = (type: 'coaching' | 'mentoring') => async (card) => {
  const personId = get(card, 'relationships.person.data.id');
  const workflowId = type === 'mentoring' ? 264250 : 101579;

  const [, notes] = await mediator.call(
    'pco:api:get',
    'people',
    `workflows/${workflowId}/cards/${card.id}/notes`,
  );
  notes.data.reverse();
  const note = notes.data.find(({ attributes }) => attributes.note.includes('Assignment'));

  const [, person] = await mediator.call('pco:api:get', 'people', `people/${personId}`);

  return {
    id: card.id,
    type: 'request',
    attributes: {
      created: card.attributes.created_at,
      relationshipType: type,
      assignment: getAssignmentStatus(note),
    },
    relationships: {
      individual: {
        data: await parsePerson(person.data),
      },
    },
  };
};

const getRequests = async (req, res) => {
  const [, mentorRequests] = await mediator.call('pco:api:get', 'people', 'workflows/264250/cards');
  const [, coachRequests] = await mediator.call('pco:api:get', 'people', 'workflows/101579/cards');

  const data = await Promise.all([
    ...mentorRequests.data
      .filter(({ attributes }) => attributes.stage !== 'completed')
      .map(parseCardData('mentoring')),
    ...coachRequests.data
      .filter(({ attributes }) => attributes.stage !== 'completed')
      .map(parseCardData('coaching')),
  ]);

  res.json({ data });
};

export default getRequests;
