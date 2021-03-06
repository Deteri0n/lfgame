const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');


module.exports = ({
    getUserByEmail,
    addUser,
    getUserByUsername,
    getPreviousSessions,
    favouriteGame,
    updateUserProfile,
    getUserByID
}) => {


    router.get('/', (req, res) => {
      jsonwebtoken.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if (err) {
          res.sendStatus(403);
        } else {
          getUserByID(data.id)
          .then(user => {
            res.json({
              id: user.id,
              username: user.username,
              email: user.email,
              steam_id: user.steam_id,
              image: user.image
            })
          })
          .catch(err => res.json(err));
        }
      })
    });

    router.post('/register', (req, res) => {

    const {
      username,
      email,
      password
    } = req.body;
        
    Promise.all([
      getUserByEmail(email),
      getUserByUsername(username)
    ]).then((all) => {
      if (all[0]) {
        res.status(401).json({error: 'Sorry, a user account with this email already exists'});
      } else if (all[1]) {
        res.status(401).json({error: 'Sorry, a user account with this username already exists'})
      } else {
        const hashedPassword = bcrypt.hashSync(password, process.env.SALT_ROUNDS | 0);
        addUser(username, email, hashedPassword)
          .then(user => res.json({
            token: jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET)
          }));
      }
    }).catch(err => res.json({
      error: err.message
    }));

  });

  router.post('/login', (req, res) => {

    const {
      email,
      password
    } = req.body;

    getUserByEmail(email)
      .then(user => {

        if (user) {            
          if (bcrypt.compareSync(password, user.password)) {
            res.json({
              token: jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET)
            });
          } else {
            res.status(401).json({ error: 'Wrong email or password. Please try again!'});
          }
        } else {
          res.status(401).json({ error: 'No account linked to this email address'});
        }
      })
      .catch(err => res.json({
        error: err
      }));
  });

  router.get('/:userID', (req, res) => {

    jsonwebtoken.verify(req.headers.authorization, process.env.JWT_SECRET, (err) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const userID = req.params.userID;
        getUserByID(userID)
          .then(user => {
            const result = { user };

            Promise.all([
              getPreviousSessions(user.id),
              favouriteGame(user.id)
            ]).then(all => {
              result.sessionsList = all[0];
              result.favourite = all[1];
              res.json(result);
            });
          })
          .catch((err) => res.json({
            error: err.message
          }));
      }
    });
  });

  router.post('/:userID', (req, res) => {
    jsonwebtoken.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const {avatar, username, email, steamID} = req.body;
        
        Promise.all([
          getUserByEmail(email),
          getUserByUsername(username)
        ]).then((all) => {
          if (all[0] && all[0].id !== data.id) {
            res.status(401).json({
              error: 'Sorry, a user account with this email already exists'
            });
          } else if (all[1] && all[1].id !== data.id) {
            res.status(401).json({
              error: 'Sorry, a user account with this username already exists'
            });
          } else {
            updateUserProfile(avatar, username, email, steamID, data.id)
            .then(result => {
              res.json({
                token: jsonwebtoken.sign({ id: result.id }, process.env.JWT_SECRET)
              })
            }).catch(err => res.json({
              error: err.message
            }));
          }
        })
      }
    });
  });

  return router;
};