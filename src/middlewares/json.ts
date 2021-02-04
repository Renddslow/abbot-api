const json = (req, res, next) => {
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json');
    if (!res.statusCode) {
      res.statusCode = 200;
    }
    res.end(JSON.stringify(body, null, 2));
  };
  next();
};

export default json;
