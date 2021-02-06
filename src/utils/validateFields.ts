import { has } from 'dot-prop';

import { JSONError } from '../types';

const validateFields = (fields: Array<string>) => (data: Record<string, any>): Array<JSONError> => {
  return fields
    .filter((p) => !has(data, p))
    .map((p) => {
      let [parent, field] = p.split('.').slice(-2);

      if (!field) {
        field = parent;
        parent = 'top-level';
      }

      return {
        status: 400,
        code: 'MissingFieldError',
        title: 'Required field was missing from request body',
        detail: `Required field "${field}" was missing from ${parent} object.`,
        source: {
          pointer: `/${p.split('.').slice(0, -1).join('/')}`,
        },
      };
    });
};

export default validateFields;
