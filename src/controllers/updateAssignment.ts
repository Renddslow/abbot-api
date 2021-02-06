import { get, has } from 'dot-prop';

import mediator from '../mediators';
import { parseCardData } from './getRequests';

const message = (status: 'pending' | 'rejected') =>
  status === 'pending' ? 'Pending Assignment:' : 'Assignment Declined:';

const updateAssignment = async (req, res) => {
  const mentorUrl = `workflows/264250/cards/${req.params.id}`;
  const coachUrl = `workflows/101579/cards/${req.params.id}`;

  if (!has(req.body, 'data.attributes.status') || !has(req.body, 'data.attributes.to')) {
    res.statusCode = 400;
    return res.json({
      errors: [{}],
    });
  }

  const [, mentorRel] = await mediator.call('pco:api:get', 'people', mentorUrl);
  const data = mentorRel || (await mediator.call('pco:api:get', 'people', coachUrl))[1];

  if (!data) {
    // TODO: 404
  }

  const workflowId = get(data, 'data.relationships.workflow.data.id', '');

  const noteUrl = `workflows/${workflowId}}/cards/${req.params.id}/notes`;
  const reqData = {
    type: 'WorkflowCardNote',
    attributes: {
      note: `${message(req.body.data.attributes.status)} ${req.body.data.attributes.to}`,
    },
  };

  await mediator.call('pco:api:post', 'people', noteUrl, {
    data: reqData,
  });

  const [, noteData] = await mediator.call(
    'pco:api:get',
    'people',
    `workflows/${workflowId}/cards/${req.params.id}`,
  );

  res.json({
    data: await parseCardData(mentorRel ? 'mentoring' : 'coaching')(noteData.data),
  });
};

export default updateAssignment;
