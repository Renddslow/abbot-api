import { JSONError } from '../types';
import { has } from 'dot-prop';

const validateRequestBody = (type: 'new' | 'existing') => (req, res, next) => {
  const errors: Array<JSONError> = [];

  if (!has(req.body, 'data')) {
    errors.push({
      status: 400,
      code: 'MissingFieldError',
      title: 'Field missing from request body',
      detail: 'Required top-level field "data" was missing from the request body.',
      source: {
        pointer: '/',
      },
    });
  }

  if (!has(req.body, 'data.type')) {
    errors.push({
      status: 400,
      code: 'MissingFieldError',
      title: 'Field missing from request body',
      detail: 'Required top-level field "type" was missing from the "data" object.',
      source: {
        pointer: '/data/',
      },
    });
  }

  if (!has(req.body, 'data.attributes')) {
    errors.push({
      status: 400,
      code: 'MissingFieldError',
      title: 'Field missing from request body',
      detail: 'Required top-level field "attributes" was missing from the "data" object.',
      source: {
        pointer: '/data/',
      },
    });
  }

  if (type === 'existing' && !has(req.body, 'data.id')) {
    errors.push({
      status: 400,
      code: 'MissingFieldError',
      title: 'Field missing from request body',
      detail: 'Required top-level field "id" was missing from the "data" object.',
      source: {
        pointer: '/data/',
      },
    });
  }

  if (errors.length) {
    res.statusCode = 400;
    return res.json({
      errors,
    });
  }

  next();
};

export default validateRequestBody;
