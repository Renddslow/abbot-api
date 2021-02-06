import { get } from 'dot-prop';

import mediator from '../mediators';
import validateFields from '../utils/validateFields';
import { createGroup } from '../mediators/accountCenter';
import getRelationship from './getRelationship';

const createRelationship = async (req, res) => {
  const validator = validateFields([
    'data.attributes.relationshipType',
    'data.relationships.leader.data.id',
    'data.relationships.individual.data.id',
  ]);

  const errors = validator(req.body);

  if (errors && errors.length) {
    res.statusCode = 400;
    return res.json({ errors });
  }

  const [leader, member] = await Promise.all([
    mediator
      .call('pco:api:get', 'people', `people/${get(req.body, 'data.relationships.leader.data.id')}`)
      .then(([, leader]) => leader),
    mediator
      .call(
        'pco:api:get',
        'people',
        `people/${get(req.body, 'data.relationships.individual.data.id')}`,
      )
      .then(([, member]) => member),
  ]);

  const title = `[${
    get(req.body, 'data.attributes.relationshipType') === 'mentoring' ? 'Mentoring' : 'Coaching'
  }] ${get(leader, 'data.attributes.first_name')}/${get(member, 'data.attributes.first_name')}`;

  const now = new Date().toISOString();

  const groupId = await createGroup(title);

  await Promise.all([
    mediator.call('pco:api:post', 'groups', `groups/${groupId}/memberships`, {
      data: {
        attributes: {
          person_id: leader.data.id,
          role: 'leader',
          joined_at: now,
        },
      },
    }),
    mediator.call('pco:api:post', 'groups', `groups/${groupId}/memberships`, {
      data: {
        attributes: {
          person_id: member.data.id,
          role: 'member',
          joined_at: now,
        },
      },
    }),
  ]);

  return getRelationship(
    {
      params: {
        id: groupId,
      },
    },
    res,
  );
};

export default createRelationship;
