const ck = require('ckey');

// import User from '../models/user';
// import Creature from '../models/creature';

const User = require('../models/user');
const Creature = require('../models/creature');

// import async from 'async';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import { v4 as uuidv4 } from 'uuid';
// import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
// import randomstring from 'randomstring';

const async = require('async');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

exports.get_dashboard = function(req, res, next) {
  res.status(200).send('Connection successfull');
}

exports.verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  const bearerToken = bearerHeader && bearerHeader.split(' ')[1];

  if (bearerToken === null) { return res.status(401); }

  jwt.verify(bearerToken, process.env.ACCESS_SECRET, (err, user) => {
    if (err) { return res.status(403); }

    req.user = user;
    next();
  });
}

exports.verifyReset = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  const bearerToken = bearerHeader && bearerHeader.split(' ')[1];

  if (bearerToken === null) { return res.status(401); }

  jwt.verify(bearerToken, process.env.RESET_SECRET, (err, user) => {
    if (err) { return res.status(403); }

    req.user = user;
    next();
  });
}

// GET user create
exports.create_user_get = function(req, res, next) {
  res.send('test');
}

// POST user create
exports.create_user_post = async function(req, res, next) {

  // returns null or with user object;
  const emailResult = await User.findOne({ 'email': req.body.email });
  if (emailResult !== null) return res.json({ result: 'Email error'})

  const usernameResult = await User.findOne({ 'username': req.body.username });
  if (usernameResult !== null) return res.json({ result: 'Username error'});
  
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    const user = new User({
      username: req.body.username.trim(),
      email: req.body.email.trim(),
      password: hash,
      reset_code: 'a',
      id: uuidv4()
    });

    user.save(function(err, results) {
      if (err) { return next(err); }

      console.log('Successfully created user: ', user);
      res.json({ result: 'Success' });
    });
  });
}

// POST reset request (returns token/code via email)
exports.reset_request_post = async function(req, res, next) {
  const users = await User.find();

  const userIndex = users.findIndex(user => user.email === req.body.email);

  const userExists = userIndex >= 0 ? true : false;

  res.send(userExists);
}

// GET reset code
exports.reset_code_get = async function(req, res, next) {
  const reset_code = randomstring.generate(10);

  const update = { reset_code };
  
  User.findOneAndUpdate({ 'email': req.body.email}, update, {upsert: false}, function(err, doc) {
    if (err) { return next(err); }

    console.log('Successfully updated reset code');
  });

  const user = {
    email: req.body.email,
    reset_code: req.body.reset_code
  };

  const reset_token = jwt.sign(user, process.env.RESET_SECRET, { expiresIn: '1800s' });

  const transporter = nodemailer.createTransport({
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: 'Your Creatures of Habit account info',
    text: `Hello, copy and paste the following code into the input box as directed on the Creatures webpage: ${reset_code}`
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.error(err);
    } else {
      return res.json({
        info: info.response,
        reset_token
      });
    }
  });
}

// POST reset code
exports.reset_code_post = async function(req, res, next) {
  const users = await User.find();

  const userIndex = users.findIndex(user => user.reset_code === req.body.reset_code);

  const codeMatches = userIndex >= 0
    ? true
    : false;

  res.send(codeMatches);
}

// PUT password reset
exports.password_reset_put = function(req, res, next) {
  const query = { 'email': req.body.email };

  const password = req.body.password;

  console.log('password', password);
  console.log('req.body.email', req.body.email);

  bcrypt.hash(password, 10, function(err, hash) {    
    const update = { password: hash };

    User.findOneAndUpdate(query, update, {upsert: false}, function(err, doc) {
      if (err) { return next(err); }

      console.log('Successfully updated user');
      res.send('Complete');
    });
  });
}

// GET usernames
exports.check_usernames = async function(req, res, next) {
  const users = await User.find({}, 'username email');

  let thisUsernameIndex = -1;
  let thisEmailIndex = -1;

  if (req.body.type === 'username') {
    thisUsernameIndex = users.findIndex(user => user.username === req.body.username);
  } else {
    thisEmailIndex = users.findIndex(user => user.email === req.body.email);
  }

  if (thisUsernameIndex >= 0) { res.json(thisUsernameIndex); }
  else if (thisEmailIndex >= 0) { res.json(thisEmailIndex); }
  else { res.send('Available'); }
}

// GET user login
exports.index = function(req, res, next) {
  // login form and signup button
  res.send('test');
}

// POST user login
exports.user_login = async function(req, res, next) {
  const users = await User.find({}, 'username email');

  let usernameIndex;
  let emailIndex;

  if (req.body.type === 'username') {
    usernameIndex = users.findIndex(user => user.username === req.body.username);
  } else if (req.body.type === 'email') {
    emailIndex = users.findIndex(user => user.email === req.body.email);
  }

  if (usernameIndex < 0) {
    return res.json({ result: 'Username error' });
  } else if (emailIndex < 0) {
    return res.json({ result: 'Email error' });
  }

  const user = req.body.type === 'username'
    ? await User.findOne({ username: req.body.username })
    : await User.findOne({ email: req.body.email });

  const passwordCorrect = (user === null)
    ? false
    : await bcrypt.compare(req.body.password, user.password);

  if (!passwordCorrect) {
    return res.json({
      result: 'Password error'
    });
  } else if (!user) {
    return res.json({ result: 'User not found' });
  }

  const userToken = {
    username: user.username,
    email: user.email,
    id: user.id,
    _id: user._id
  };

  const accessToken = jwt.sign(userToken, process.env.ACCESS_SECRET, { expiresIn: '2h' });

  return res.json({
    accessToken,
    username: user.username || '',
    email: user.email || '',
    db_id: user._id,
    result: 'Success'
  });
}

// POST localStorage creatures
exports.store_local_creatures_post = async function(req, res, next) {
  const user = await User.findById(req.user._id);

  const creatures = req.body;

  for (let i = 0; i < creatures.length; i++) {
    const creature = {
      age: creatures[i].age,
      birth_time: creatures[i].birthTime || creatures[i].birth_time,
      birth_date: creatures[i].birthdate || creatures[i].birth_date,

      creature: creatures[i].creature,
      creature_name: creatures[i].creatureName || creatures[i].creature_name,
      difficulty: creatures[i].difficulty,
      evolutions: creatures[i].evolutionaryLine || creatures[i].evolutions,

      purpose: creatures[i].purpose,
      purpose_name: creatures[i].purposeName || creatures[i].purpose_name,
      
      exp: creatures[i].exp,
      exp_goal: creatures[i].expGoal || creatures[i].exp_goal,
      exp_surplus: creatures[i].expSurplus || creatures[i].exp_surplus,
      prev_exp_goal: creatures[i].prevGoal || creatures[i].prev_exp_goal,

      id: creatures[i].id,
      is_noob: creatures[i].isNoob || creatures[i].is_noob,
      level: creatures[i].level,
      multiplier: creatures[i].multiplier,

      objectives: creatures[i].objectives,
      pokeball_number: creatures[i].pokeballNumber || creatures[i].pokeball_number,
      sprite: creatures[i].sprite,

      streak_count: 1,
      streak_day: (new Date()).getDay(),
      streak_timestamp: Date.now(),

      user
    };

    new Creature(creature).save(function(err, results) {
      if (err) { return next(err); }

      console.log('Successfully added creature: ', creature);
    });
  }

  return res.send('Successfully updated user');
}

// GET all users
exports.get_users = function(req, res, next) {

  if (!req.user) return;

    User.find()
      .exec(function(err, users) {
        if (err) { return next(err); }

        if (users === null) {
          let err = new Error('No users');
          err.status = 404;
          return next(err);
        }

        return res.json(users);
      });
}

// GET current user details
exports.user_detail = async function(req, res, next) {

  console.log('req.user', req.user);

  async.parallel({
    user: function(callback) {
      User.findById(req.user._id)
        .populate('creatures')
        .exec(callback);
    },
    user_creatures: function(callback) {
      Creature.find({ 'user': req.user._id })
        .populate('user')
        .exec(callback);
    },
  }, function(err, results) {
    if (err) { next(err); }

    if (results.user === null) {
      let err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    console.log(results.user_creatures);

    results.new_time = Date.now();
    results.new_day = (new Date()).getDay();

    return res.send(results);
  });
}

// GET user update
exports.update_user_get = function(req, res, next) {
  res.send('test');
}

// POST user update
exports.update_user = function(req, res, next) {
  const query = { _id: req.user._id };

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  let update;

  if (req.body.type === 'updatePassword') {

    bcrypt.hash(password, 10, function(err, hash) {
      console.log('password', password);
      console.log('username', username);
      console.log('email', email);
      
      update = {
        username,
        email,
        password: hash,
      };
    });

  } else if (req.body.type === 'update') {
    // Updates username and/or email
    update = { username, email };

  } else {
    // Updates creatures (after auto-updating streak or age)
    
    const creatures = req.body.creatures;

    console.log('creatures', creatures)
    update = { creatures };
  }

  User.findOneAndUpdate(query, update, {upsert: false}, function(err, doc) {
    if (err) { return next(err); }

    res.json({ result: 'Successfully updated user' });
  });
}

// PUT user update (creatures and info)
exports.update_all = function(req, res, next) {
  // updates everything

  const query = { _id: req.user._id };

  const user = req.body;

  const update = { user };

  User.findOneAndUpdate(query, update, {upsert: false}, function(err, doc) {
    if (err) { return next(err); }

    console.log('Successfully updated user before logout');
    return res.json(doc);
  });
}

// GET user delete
exports.delete_user_get = function(req, res, next) {
  res.send('test');
}

// POST user delete
exports.delete_user = function(req, res, next) {
  console.log('Deleting user...');
  console.log(req.user._id);

  Creature.deleteMany({ 'user': req.user._id }, function(err) {
    if (err) {
      console.log('Error: ' + err);
      return next(err);
    }

    console.log('Successfully deleted user creatures');
  });

  User.findByIdAndDelete(req.user._id, function(err) {
    if (err) {
      console.log('Error: ' + err);
      return next(err);
    }

    res.send('Successfully delete user');
  });
}

exports.user_logout_get = function(req, res, next) {
  req.logout();
  res.redirect('/');
}
