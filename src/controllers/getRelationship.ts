import { get } from 'dot-prop';

import mediator from '../mediators';

const getRelationship = async (req, res) => {
  const [, group] = await mediator.call('pco:api:get', 'groups', `groups/${req.params.id}`);

  if (!group) {
    // TODO: 404
  }

  const [, members] = await mediator.call(
    'pco:api:get',
    'groups',
    `groups/${group.data.id}/people`,
  );
  const leader = get(members, 'data', []).filter(
    ({ attributes }) => attributes.permissions === 'administrator',
  );
  const member = get(members, 'data', []).filter(
    ({ attributes }) => attributes.permissions !== 'administrator',
  );

  const attributes = get(group, 'data.attributes', <Record<string, any>>{});

  const data = {
    id: req.params.id,
    type: 'relationship',
    attributes: {
      meta: attributes.description && JSON.parse(attributes.description),
      created: attributes.created_at,
      relationshipType: attributes.name.includes('[Coaching]') ? 'coaching' : 'mentoring',
      archived: !!attributes.archived_at,
    },
    relationships: {
      leader: {
        data: {
          type: 'person',
          id: get(leader, '0.id'),
          attributes: {
            firstName: get(leader, '0.attributes.first_name'),
            lastName: get(leader, '0.attributes.last_name'),
            avatar: get(leader, '0.attributes.avatar_url'),
          },
        },
      },
      individual: {
        data: {
          type: 'person',
          id: get(member, '0.id'),
          attributes: {
            firstName: get(member, '0.attributes.first_name'),
            lastName: get(member, '0.attributes.last_name'),
            avatar: get(member, '0.attributes.avatar_url'),
          },
        },
      },
    },
  };

  res.json({ data });
};

export default getRelationship;
