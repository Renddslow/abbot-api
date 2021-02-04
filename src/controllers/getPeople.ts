import mediator from '../mediators';
import { parsePerson } from './getPerson';

const getPeople = async (req, res) => {
  const [, data] = await mediator.call('pco:api:get', 'people', 'people', req.query);

  return res.json({
    data: await Promise.all(data.data.map(parsePerson)),
  });
};

export default getPeople;
