import mediator from '../mediators';
import { parsePerson } from './getPerson';

const getCoaches = async (req, res) => {
  const [, data] = await mediator.call('pco:api:get', 'people', 'lists/1613228/people');
  return res.json({
    data: await Promise.all(data.data.map(parsePerson)),
  });
};

export default getCoaches;
