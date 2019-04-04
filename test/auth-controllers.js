const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const authController = require('../controllers/auth');
const validator = require('../utili/validator');
const User = require('../models/user');

describe('User authentication', () => {
    before(function(done){
        let mongodbUrl = 'mongodb://127.0.0.1:27017/test-login';
        mongoose.connect(mongodbUrl, {
            useNewUrlParser: true
        })
        .then(result => {
            const user = new User({
                email: 'test@test.com',
                password: '123123',
                name: 'Test',
                posts: [],
                _id: '5c9a1c4e1452f12db91e1d12'
            })
            return user.save();
        })
        .then(() => {
            done();
        })
    })

    describe('User sign up', function(){
        it('User sign up success', function(done){
            const req = {
                body: {
                    email: '123@test.com', 
                    password: '123123',
                    name: 'test'
                }
            };
    
            const res = {
                statusCode: 500,
                message: 'User Create failed',
                status: function(code){
                    this.statusCode = code;
                    return this;
                },
                json: function(message){
                    this.message = message;
                }
            }
    
            sinon.stub(validator, 'validate').returns([]);
    
            authController.signup(req, res, () => {}).then(() => {
                expect(res.statusCode).to.equal(201);
                done();
            });
            
            validator.validate.restore();
        });
    
        it('User sign up validation failed', function(done){
    
            sinon.stub(validator, 'validate').returns([1]);
    
            authController.signup({}, {}, () => {}).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 422);
            })
            .then(() => {
                done();
            });;

            validator.validate.restore();
        });

        it('Sign up email exist', function(done){
            const req = {
                body: {
                    email: 'test@test.com',
                    password: '123123',
                    name: '' 
                }
            }  
    
            authController.signup(req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 422);
            })
            .then(() => {
                done();
            })
        });
    })

    describe('User login', function(){
        it('User email not found', function(done){
            const req = {
                body: {
                    email: 'failtest@test.com'
                }
            }
    
            authController.login(req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 401);
                done();
            })
        });

        it('User password not matched', function(done){
            const req = {
                body: {
                    email: 'test@test.com',
                    password: '456456'
                }
            
            }
            
            sinon.stub(validator, 'passwordValidate').returns(false);

            authController.login(req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 401);
            })
            .then(() => {
                done();
                validator.passwordValidate.restore();
            });

        });

        it('User login success', function(done){
            const req = {
                body: {
                    email: 'test@test.com',
                    password: '123123'
                }
            }

            const res = {
                statusCode: 500,
                message: 'User Create failed',
                status: function(code){
                    this.statusCode = code;
                    return this;
                },
                json: function(message){
                    this.message = message;
                }
            }

            sinon.stub(validator, 'passwordValidate').returns(true);

            authController.login(req, res, () => {}).then(() => {
                expect(res.statusCode).to.be.equal(201);
                expect(res.message).to.have.property('token');
            })
            .then(() => {
                done();
                validator.passwordValidate.restore();
            });
        })
    })
   
    after(function(done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
})