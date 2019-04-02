const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const validator = require('../utili/validator');

exports.signup = async (req, res, next) => {

    try{
        let errors = validator.validate(req);

        if(errors.length !== 0){
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors
            throw error;
        }

        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;

        const hashedPw = await bcrypt.hash(password, 12);
        user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        
        let result = await user.save();

        res.status(201).json({message: 'User created!', userId: result._id});
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
          return err;
    }
    
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try{

        const user = await User.findOne({email: email})

        if(!user){
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        let isMatched = validator.passwordValidate(user, password);

        if(!isMatched){
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
              email: user.email,
              userId: user._id.toString()
            },
            'somesupersecretsecret',
            { expiresIn: '1h' }
          );

          res.status(201).json({token: token, userId: user._id.toString()});
          return;
    }catch (err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
          return err;
    }
}