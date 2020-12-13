// import { Router } from 'express';
// const router = Router();
const router = require('express').Router();

router.get('/', (req, res) => {
  console.log('index router start');
  console.log('NODE_ENV', process.env.NODE_ENV);
  console.log('hostname', req.hostname);
  console.log('url', req.url);
  console.log('header', req.header('x-forwarded-proto'));
  res.redirect('/dashboard');
});

// export default router;
module.exports = router;
