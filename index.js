const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-module.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

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
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Password or Username is not correct. Please try again.' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });
  
  function restricted(req, res, next) {
    const { username, password } = req.headers;
  
    if (username && password) {
      Users.findBy({ username })
        .first()
        .then(user => {
          if (user && bcrypt.compareSync(password, user.password)) {
            next();
          } else {
            res.status(401).json({ message: 'Password or Username is not correct. Please try again.' });
          }
        })
        .catch(error => {
          res.status(500).json({ message: 'Ran into an unexpected error' });
        });
    } else {
      res.status(400).json({ message: 'You shall not pass! Please provide Username and Password.' });
    }
  }

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



const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));