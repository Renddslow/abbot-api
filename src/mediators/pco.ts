import got from 'got';
import catchify from 'catchify';
import qs from 'qs';

const PCO_ID = process.env.PCO_ID;
const PCO_SECRET = process.env.PCO_SECRET;

export const apiGet = async (resource, route, query = {}) => {
  const baseUrl = `https://api.planningcenteronline.com/${resource}/v2/${route}`;
  const queryString = qs.stringify(query, { encode: false });
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  const [err, data] = await catchify(
    got(url, {
      username: PCO_ID,
      password: PCO_SECRET,
    }).json(),
  );

  return [err, data];
};
