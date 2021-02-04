import { get } from 'dot-prop';

import mediator from '../mediators';

const getRelationships = async (req, res) => {
  const [, data] = await mediator.call('pco:api:get', 'groups', `group_types/190252/groups`);
  res.json({
    data: await Promise.all(
      get(data, 'data', []).map(async ({ attributes, id }) => {
        const [, members] = await mediator.call('pco:api:get', 'groups', `groups/${id}/people`);
        const leader = get(members, 'data', []).filter(
          ({ attributes }) => attributes.permissions === 'administrator',
        );
        const member = get(members, 'data', []).filter(
          ({ attributes }) => attributes.permissions !== 'administrator',
        );

        return {
          id,
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
      }),
    ),
  });
};

export default getRelationships;
