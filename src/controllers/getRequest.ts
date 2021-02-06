import mediator from '../mediators';
import { parseCardData } from './getRequests';

const getRequest = async (req, res) => {
  const [, mentorRel] = await mediator.call(
    'pco:api:get',
    'people',
    `workflows/264250/cards/${req.params.id}`,
  );
  const data =
    mentorRel ||
    (await mediator.call('pco:api:get', 'people', `workflows/101579/cards/${req.params.id}`))[1];

  if (!data) {
    // TODO: 404
  }

  res.json({ data: await parseCardData(mentorRel ? 'mentoring' : 'coaching')(data.data) });
};

export default getRequest;
