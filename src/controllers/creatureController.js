import User from '../models/user';
import Creature from '../models/creature';

import async from 'async';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import passportJWT from 'passport-jwt';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// GET all creatures
exports.creature_list = function(req, res, next) {

  Creature.find({ 'user': req.user._id })
    .exec(function(err, results) {
      if (err) { return next(err); }

      return res.json(results);
    });
}

// GET creature create
exports.create_creature_get = function(req, res, next) {
  res.send('test');
}

// POST creature create
exports.create_creature_post = async function(req, res, next) {
  const user = await User.findById(req.user._id);

  console.log(req.body);

  const newDay = (new Date()).getDay();
  
  let newStreak;
  if (newDay === 0) {
    newStreak = 4;
  } else if (newDay === 1) {
    newStreak = 5;
  } else {
    newStreak = newDay - 2;
  }

  const creature = new Creature({
    id: req.body.id,
    creature: req.body.creature,
    creature_name: req.body.creature_name,
    purpose: req.body.purpose,
    purpose_name: req.body.purpose_name,
    evolutions: req.body.evolutions,
    level: req.body.level,
    exp: req.body.exp,
    exp_goal: req.body.exp_goal,
    prev_exp_goal: req.body.prev_exp_goal,
    exp_surplus: req.body.exp_surplus,
    difficulty: req.body.difficulty,
    multiplier: req.body.multiplier,
    birth_date: req.body.birth_date,
    birth_time: Date.now(),
    age: req.body.age,
    is_noob: true,
    pokeball_number: req.body.pokeball_number,
    streak_count: 0,
    streak_day: newStreak,
    streak_timestamp: Date.now() - 86400000,
    objectives: [],
    user
  });

  creature.save(function(err, results) {
    if (err) {
      console.log('Error: ' + err);
      return next(err);
    }

    console.log('Successfully added new creature: ' + creature);

    return res.json(results);
  });
}

// GET creature exp/level/evo details + objectives
exports.update_creature_stats_get = function(req, res, next) {

  Creature.findById(req.params.id)
    .exec(function(err, results) {
      if (err) { return next(err); }

      if (results.creature === null) {
        let err = new Error('Creature not found');
        err.status = 404;
        return next(err);
      }

      return res.json(results);
    });
}

// POST creature exp/level/streak/evo update
exports.update_creature_stats = async function(req, res, next) {
  const query = { _id: req.params.id };

  const update = {
    creature: req.body.creature,
    evolutions: req.body.evolutions,
    exp: req.body.exp,
    exp_goal: req.body.exp_goal,
    prev_exp_goal: req.body.prev_exp_goal,
    exp_surplus: req.body.exp_surplus,
    level: req.body.level,
    difficulty: req.body.difficulty,
    multiplier: req.body.multiplier,
    age: req.body.age,
    is_noob: req.body.is_noob,
    pokeball_number: req.body.pokeball_number,
    streak_count: req.body.streak_count,
    streak_timestamp: req.body.streak_timestamp,
    streak_day: req.body.streak_day,
  };

  Creature.findOneAndUpdate(query, update, {upsert: true}, function(err, doc) {
    if (err) { return next(err); }

    return res.send('Successfully updated creature');
  });
}

exports.update_creature_objectives_get = function(req, res, next) {
  res.send('test');
}

exports.update_objectives = async function(req, res, next) {
  if (!req.user) return;

  const query = { _id: req.params.id };

  const objectives = req.body;

  console.log('objectives', objectives)

  const update = { objectives };

  Creature.findOneAndUpdate(query, update, {upsert: true}, function(err, doc) {
    if (err) { return next(err); }

    return res.send('Successfully updated creature');
  });
}

// GET creature info update
exports.update_creature_info_get = function(req, res, next) {
  res.send('test');
}

// POST creature info update
exports.update_creature_info_put = function(req, res, next) {
  if (!req.user) return;

  const query = { _id: req.params.id };

  const update = {
    creature_name: req.body.creature_name,
    creature: req.body.creature,
    evolutions: req.body.evolutions,
  };

  Creature.findOneAndUpdate(query, update, {upsert: false}, function(err, doc) {
    if (err) { return next(err); }

    return res.send('Successfully updated creature');
  });
}

// GET creature delete
exports.delete_creature_get = function(req, res, next) {
  res.send('test');
}

// POST creature delete
exports.delete_creature_post = function(req, res, next) {
  if (!req.user) return;
  
  Creature.findByIdAndDelete(req.params.id, function(err) {
    if (err) { return next(err); }

    console.log('Successfully deleted creature');
  });
}
