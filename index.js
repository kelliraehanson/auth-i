const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const db = require('./database/dbConfig.js');
const Users = require('./users/users-module.js');

const server = express();

const sessionConfig = {
  name: 'banana',
  secret: 'it is a secret!',
  cookie: {
    maxAge: 1000 * 60 * 15,
    secure: false,
  },
  httpOnly: true, // you want this to be true 99% of the time
  resave: false, 
  saveUninitialized: false,  

  store: new KnexSessionStore({
    knex: db,
    tablename: 'sessions',
    sidfieldname: 'sid', // this is no something that will go through the browser
    createtable: true,
    clearInterval: 1000 * 60 * 60, 
  }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

// GET /

server.get('/', (req, res) => {
  res.send("<h1>Hi. The / is working.</h1>");
});

// POST /API/REGISTER

server.post('/api/register', (req, res) => {
    let user = req.body;
  
    // generate hash from user's password
    const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  
    // override user.password with hash
    user.password = hash;
  
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });

  // POST /API/LOGIN
  
  server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        // check that passwords match
        if (user && bcrypt.compareSync(password, user.password)) {
          req.session.user = user;
          res.status(200).json({ message: `Welcome ${user.username}, sending back a cookie!` });
        } else {
          res.status(401).json({ message: 'Password or Username is not correct. Please try again.' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });

  function restricted(req, res, next) {
    if (req.session && req.session.user) {
      next();
    } else {
      res.status(401).json({ message: 'You shall not pass!' });
    }
  }
  
  // function restricted(req, res, next) {
  //   const { username, password } = req.headers;
  
  //   if (username && password) {
  //     Users.findBy({ username })
  //       .first()
  //       .then(user => {
  //         if (user && bcrypt.compareSync(password, user.password)) {
  //           next();
  //         } else {
  //           res.status(401).json({ message: 'Password or Username is not correct. Please try again.' });
  //         }
  //       })
  //       .catch(error => {
  //         res.status(500).json({ message: 'Ran into an unexpected error' });
  //       });
  //   } else {
  //     res.status(400).json({ message: 'You shall not pass! Please provide Username and Password.' });
  //   }
  // }

  // GET /API/USERS
  
  // protect this route, only authenticated users should see it
  server.get('/api/users', restricted, (req, res) => {
    Users.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  });
  
  // GET EXAMPLE OF ASYNC/AWAIT

  server.get('/users', restricted, async (req, res) => {
    try {
      const users = await Users.find();
  
      res.json(users);
    } catch (error) {
      res.send(error);
    }
  });

  server.get('/api/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.send(
            'Opps! There was an error logging out.'
          );
        } else {
          res.send('bye');
        }
      });
    } else {
      res.end();
    }
  });
  

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));