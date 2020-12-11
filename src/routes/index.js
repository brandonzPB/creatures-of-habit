import { Router } from 'express';
const router = Router();
// const router = require('express').Router();

router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

export default router;
