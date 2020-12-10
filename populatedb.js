#! /usr/bin/env node

// Get arguments passed on command line
let userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const { v4: uuidv4 } = require('uuid');
const User = require('./src/models/user');
const Creature = require('./src/models/creature');
const Objective = require('./src/models/objective');

const mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let users = [];
let creatures = [];
let objectives = [];

function userCreate(username, email, cb) {
  user_detail = { username, email };
  user_detail.id = uuidv4();

  let user = new User(user_detail);

  user.save(function(err) {
    if (err) { return cb(err, null); }

    console.log('New User: ' + user);

    users.push(user);
    return cb(null, user);
  });
}

function creatureCreate(user, creature, creature_name, purpose, purpose_name, second_creature, third_creature, fourth_creature, cb) {
  creature_detail = {
    user,
    id: uuidv4(),
    creature,
    creature_name,
    purpose,
    purpose_name,
    second_creature,
    third_creature,
    fourth_creature,
    difficulty: 'Medium',
    level: 1,
    exp: 0,
    exp_goal: 1,
    exp_surplus: 0,
    prev_exp_goal: 0,
    multiplier: 1.25,
    birth_date: new Date(),
    birth_time: Date.now(),
    age: 0,
    is_noob: true,
    pokeball_number: 1,
    streak_count: 0,
    streak_timestamp: Date.now(),
  };

  let newCreature = new Creature(creature_detail);

  newCreature.save(function(err) {
    if (err) { return cb(err, null); }

    console.log('New Creature: ' + newCreature);

    creatures.push(newCreature);
    return cb(null, newCreature);
  });
}

function objectiveCreate(user, creature, text, is_timed, difficulty, cb) {
  let objective_detail = {
    user,
    creature,
    id: uuidv4(),
    text,
    is_timed,
    difficulty,
    difficulty_factor: 1.125,
  };

  let objective = new Objective(objective_detail);

  objective.save(function(err) {
    if (err) { return cb(err, null); }

    console.log('New Objective: ' + objective);

    objectives.push(objectives);
    return cb(null, objectives);
  });
}

function createUsers(cb) {

    async.parallel([
      function(callback) {
        userCreate('brandonzpb', 'brandonz@email.com', callback);
      },
      function(callback) {
        userCreate('honeybunny', 'bunny.chubster@tedder.com', callback);
      }
    ], 
    cb);
}

function createCreatures(cb) {

    async.parallel([
      function(callback) {
        creatureCreate(users[0], 'Abra', 'Seneca', 'Purpose/Vocation', 'Stoic', 'Kadabra', 'Alakazam', 'Alakazam-mega', callback);
      },
      function(callback) {
        creatureCreate(users[1], 'Snorlax', 'Arny', 'Self-Improvement', 'Body Builder', 'None', 'Machoke', 'Machamp', callback);
      },
      function(callback) {
        creatureCreate(users[0], 'Porygon', 'duck.js', 'Purpose/Vocation', 'Software Developer', 'Porygon2', 'Porygon-Z', 'None', callback);
      }
    ],
    cb);
}

function createObjectives(cb) {
    
  async.series([
    function(callback) {
      objectiveCreate(users[0], creatures[0], 'Visualize', false, 'Medium-Easy', callback);
    },
    function(callback) {
      objectiveCreate(users[1], creatures[1], 'Cardio', true, 'Medium', callback);
    },
    function(callback) {
      objectiveCreate(users[0], creatures[0], 'Memento Mori', false, 'Medium-Hard', callback);
    },
    function(callback) {
      objectiveCreate(users[1], creatures[2],'Complete a Project', false, 'Hard', callback);
    }
  ],
  cb);
}

async.series([
  createUsers,
  createCreatures,
  createObjectives
],
function(err, results) {
  if (err) {
    console.log('FINAL ERR: ' + err);
  } else {
    console.log('CREATURES: ' + creatures);
  }

  mongoose.connection.close();
});
