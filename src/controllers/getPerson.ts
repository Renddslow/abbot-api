import { get } from 'dot-prop';

import mediator from '../mediators';
import getPermissions from '../utils/getPermissions';

const getEmail = async (id: string) => {
  const [, email] = await mediator.call('pco:api:get', 'people', `people/${id}/emails`, {
    where: {
      primary: true,
    },
  });

  return get(email, 'data.0.attributes.address', '');
};

export const parsePerson = async (person, include: string = '') => ({
  type: 'person',
  id: person.id,
  attributes: {
    firstName: person.attributes.first_name,
    lastName: person.attributes.last_name,
    email: await getEmail(person.id),
    name: person.attributes.name,
    avatar: person.attributes.avatar,
    permissions: include === 'permissions' ? await getPermissions(person.id) : undefined,
  },
});

const getPerson = async (req, res) => {
  const id = req.params.id;
  const [, data] = await mediator.call('pco:api:get', 'people', `people/${id}`, req.query);

  if (!data) {
    // TODO: 404
  }

  return res.json({
    data: await parsePerson(data.data, 'permissions'),
  });
};

export default getPerson;
