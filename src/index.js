const ck = require('ckey');
const dotenv = require('dotenv');
dotenv.config();

// import mongoose from 'mongoose';
// import express from 'express';
// import session from 'express-session';
// import bodyParser from 'body-parser';
// import cors from 'cors';

// import indexRouter from './routes/index';
// import dashboardRouter from './routes/dashboard';
// import path from 'path';
// import compression from 'compression';
// import helmet from 'helmet';

const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const indexRouter = require('./routes/index');
const dashboardRouter = require('./routes/index');

const PORT = process.env.PORT || 3001;
const mongoDB = process.env.DATABASE_URL;

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
const db = mongoose.connection;

db.on('Error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', function() {
  console.log('MongoDB connection successful!');
});

app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect('https://' + req.hostname + req.url);
    } else {
      next();
    }
  });
}

app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
}));

app.use(express.json());

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!!`);
});
