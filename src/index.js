const ck = require('ckey');

import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

import indexRouter from './routes/index';
import dashboardRouter from './routes/dashboard';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';

const PORT = ck.PORT || 8080;
const mongoDB = ck.DATABASE_URL;

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

// const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'https://bz-creatures-of-habit.herokuapp.com'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log('** Origin of request' + origin);
    
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       console.log('Origin acceptable');
//       callback(null, true);
//     } else {
//       console.log('Origin rejected');
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }

app.use(cors());

if (ck.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// app.use(express.static());

app.use(session({ secret: ck.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(express.json());

app.setHeader('Access-Control-Allow-Headers', 'Authorization');

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!!`);
});
