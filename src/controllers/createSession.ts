import { get } from 'dot-prop';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import { promisify } from 'util';
import catchify from 'catchify';

import mediator from '../mediators';
import { getFieldId } from '../utils/fields';
import getPermissions from '../utils/getPermissions';
import path from 'path';

const SECRET = process.env.SECRET;

const renderFile = promisify(ejs.renderFile);

const createSession = async (req, res) => {
  const { email } = get(req.body, 'data.attributes');

  const [err, data] = await mediator.call('pco:api:get', 'people', 'people', {
    where: {
      search_name_or_email: email,
    },
    include: 'field_data',
  });

  if (err) {
    res.statusCode = 401;
    return res.json({
      errors: [
        {
          code: 'NotAuthorizedError',
        },
      ],
    });
  }

  const matches = get(data, 'data', []);
  const permissionMap = get(data, 'included', []).reduce((acc, inc) => {
    if (get(inc, 'relationships.field_definition.data.id') === getFieldId('has_app_access')) {
      acc[get(inc, 'relationships.customizable.data.id', '')] =
        get(inc, 'attributes.value') === 'true';
    }

    return acc;
  }, {});

  const permittedTokens = (
    await Promise.all(
      matches
        .filter(({ id }) => permissionMap[id])
        .map(async (person) => {
          return {
            id: person.id,
            permissions: await getPermissions(person.id),
            firstName: person.attributes.first_name,
            lastName: person.attributes.last_name,
            email,
            name: person.attributes.name,
            avatar: person.attributes.avatar,
          };
        }),
    )
  ).map((person) => ({
    token: jwt.sign(person, SECRET, { expiresIn: '.5y' }),
    ...person,
  }));

  if (!permittedTokens.length) {
    res.statusCode = 403;
    return res.json({
      errors: [
        {
          code: 'InsufficientPermissionError',
          detail: 'You may not have permission to use this app.',
        },
      ],
    });
  }

  // email tokens
  const message = await renderFile(path.join(__dirname, '../template.ejs'), { permittedTokens });
  await mediator.call('email', email, 'Your Magic Link for Flatland Relationships', message);

  const plural = new Intl.PluralRules('en-US', { type: 'ordinal' });
  const map = {
    one: 'a',
    two: 'a couple of',
    few: 'a few',
    other: 'a handful of',
  };

  res.json({
    meta: {
      message: `We found ${map[plural.select(permittedTokens.length)]} matching account${
        permittedTokens.length > 1 ? 's' : ''
      }. We've sent an email to "${email}" with your magic link.`,
    },
  });
};

export default createSession;
