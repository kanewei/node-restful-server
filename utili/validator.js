const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

exports.validate = (req) => {
    //console.log(req)
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        return errors.array();
    }

    return [];
}

exports.passwordValidate = (user, password) => {
    let isMatched = bcrypt.compare(password, user.password).then(result => {
        return result;
    });

    return isMatched;
}