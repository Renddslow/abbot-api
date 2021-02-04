import jwt from 'jsonwebtoken';
import getPermissions from '../utils/getPermissions';
import { FIELDS } from '../utils/fields';

const auth = (secret: string, permission?: keyof typeof FIELDS) => async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    res.statusCode = 401;
    return res.json({
      errors: [
        {
          code: 'NotAuthorizedError',
        },
      ],
    });
  }

  const [, token] = header.split(' ');
  try {
    req.user = jwt.verify(token, secret);
  } catch (e) {
    res.statusCode = 401;
    return res.json({
      errors: [
        {
          code: e.name === 'TokenExpiredError' ? e.name : 'InvalidTokenError',
        },
      ],
    });
  }

  req.user.permissions = await getPermissions(req.user.id);

  const canStillUseApp = req.user.permissions.filter(
    ({ name, allowed }) => name === 'has_app_access' && allowed,
  ).length;
  const hasSpecifiedPermission = permission
    ? req.user.permissions.filter(({ name, allowed }) => name === permission && allowed).length
    : true;

  if (!canStillUseApp || !hasSpecifiedPermission) {
    res.statusCode = 403;
    return res.json({
      errors: [
        {
          code: 'InsufficientPermissionError',
        },
      ],
    });
  }

  next();
};

export default auth;
