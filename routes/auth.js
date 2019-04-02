const express = require('express');
const routers = express.Router();
const { body } = require('express-validator/check');

const User = require('../models/user');

const authController = require('../controllers/auth');

routers.put('/signup',[
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ], authController.signup);

routers.post('/login', authController.login);

module.exports = routers;