// import { Router } from 'express';
// import user_controller from '../controllers/userController';
// import creature_controller from '../controllers/creatureController';
// const router = Router();

const router = require('express').Router();
const user_controller = require('../controllers/userController');
const creature_controller = require('../controllers/creatureController');

/// USER ROUTES ///

// GET dashboard
router.get('/', (req, res, next) => {
  res.send('Index page');
});

// GET user create
router.get('/user/create', user_controller.create_user_get);

// POST user create
router.post('/user/create', user_controller.create_user_post);

// GET user login
router.get('/user/login', user_controller.index);

// POST user login
router.post('/user/login', user_controller.user_login);

// POST reset request
router.post('/user/reset', user_controller.reset_request_post);

// POST reset code request
router.post('/user/reset_code_email', user_controller.reset_code_get);

// POST reset code
router.post('/user/reset_code', user_controller.verifyReset, user_controller.reset_code_post);

// PUT password reset
router.put('/user/reset_password', user_controller.verifyReset, user_controller.password_reset_put);

// POST username to check
router.post('/user/usernames', user_controller.verifyToken, user_controller.check_usernames);

// GET user update
router.get('/user/:id/update', user_controller.update_user_get);

// PUT user update
router.put('/user/:id/update', user_controller.verifyToken, user_controller.update_user);

// GET user info
router.get('/user/:id', user_controller.verifyToken, user_controller.user_detail);

// POST localStorage creatures
router.post('/user/:id', user_controller.verifyToken, user_controller.store_local_creatures_post);

// POST user delete
router.delete('/user/:id', user_controller.verifyToken, user_controller.delete_user);

// GET all users
router.get('/users', user_controller.verifyToken, user_controller.get_users);

/// CREATURE ROUTES ///

// GET creature create
router.get('/user/:userId/creature/create', creature_controller.create_creature_get);

// POST creature create
router.post('/user/:userId/creature/create', user_controller.verifyToken, creature_controller.create_creature_post);

// GET creature update
router.get('/user/:userId/creature/:id/info', creature_controller.update_creature_info_get);

// PUT creature update
router.put('/user/:userId/creature/:id/info', user_controller.verifyToken, creature_controller.update_creature_info_put);

// GET creature objectives
router.get('/user/:userId/creature/:id/objectives', creature_controller.update_creature_objectives_get);

// PUT new objective
router.put('/user/:userId/creature/:id/objectives', user_controller.verifyToken, creature_controller.update_objectives);

// DELETE creature
router.delete('/user/:userId/creature/:id/delete', user_controller.verifyToken, creature_controller.delete_creature_post);

// GET creature stats
router.get('/user/:userId/creature/:id', creature_controller.update_creature_stats_get);

// POST creature stats updates
router.put('/user/:userId/creature/:id', user_controller.verifyToken, creature_controller.update_creature_stats);

// GET user creatures
router.get('/user/:id/creatures', user_controller.verifyToken, creature_controller.creature_list);

// export default router;
module.exports = router;
