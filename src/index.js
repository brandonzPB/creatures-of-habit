const ck = require('ckey');

import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

import indexRouter from './routes/index';
import dashboardRouter from './routes/dashboard';
import path from 'path';

const PORT = ck.PORT || 8080;
const mongoDB = ck.DATABASE_URL;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
const db = mongoose.connection;

db.on('Error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', function() {
  console.log('MongoDB connection successful!');
});

const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'https://bz-creatures-of-habit.herokuapp.com'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log('** Origin of request' + origin);
    
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log('Origin acceptable');
      callback(null, true);
    } else {
      console.log('Origin rejected');
      callback(new Error('Not allowed by CORS'));
    }
  }
}

app.use(cors(corsOptions));

if (ck.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.use(session({ secret: 'chunkypb', resave: false, saveUninitialized: true }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!!`);
});
