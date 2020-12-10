const ck = require('ckey');

import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';

import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import indexRouter from './routes/index';
import dashboardRouter from './routes/dashboard';
import path from 'path';
import User from './models/user';

const PORT = ck.PORT || 3001;
const mongoDB = ck.DATABASE_URL;

const app = express();

mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
const db = mongoose.connection;

db.on('Error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', function() {
  console.log('MongoDB connection successful!');
});

// change to build for production?
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.use(cors());
app.use(session({ secret: 'chunkypb', resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!!`);
});
