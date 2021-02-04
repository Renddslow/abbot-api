import mediator from '../mediators';
import { FIELDS, getFieldName } from './fields';
import { get } from 'dot-prop';

const getPermissions = async (id: string) => {
  const [, data] = await mediator.call('pco:api:get', 'people', `people/${id}/field_data`, {
    where: {
      field_definition_id: Array.prototype.slice.call(Object.entries(FIELDS)).join(','),
    },
  });

  return get(data, 'data', []).map((datum) => {
    const id = get(datum, 'relationships.field_definition.data.id', '');
    return {
      id,
      allowed: get(datum, 'attributes.value') === 'true',
      name: getFieldName(id),
    };
  });
};

export default getPermissions;
