import mediator from '../mediators';
import { get } from 'dot-prop';

const deleteRequest = async (req, res) => {
  const mentorUrl = `workflows/264250/cards/${req.params.id}`;
  const coachUrl = `workflows/101579/cards/${req.params.id}`;

  const [, mentorRel] = await mediator.call('pco:api:get', 'people', mentorUrl);
  const data = mentorRel || (await mediator.call('pco:api:get', 'people', coachUrl))[1];

  if (!data) {
    // TODO: 404
  }

  const workflowId = get(data, 'data.relationships.workflow.data.id', '');

  await mediator.call(
    'pco:api:post',
    'people',
    `workflows/${workflowId}/cards/${req.params.id}/promote`,
  );

  res.statusCode = 204;
  res.end();
};

export default deleteRequest;
