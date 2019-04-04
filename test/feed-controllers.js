const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const feedController = require('../controllers/feed');
const validator = require('../utili/validator');
const User = require('../models/user');
const Post = require('../models/post');

describe('User create post', function(){
    before(function(done){
        let mongodbUrl = 'mongodb://127.0.0.1:27017/test-login';
        mongoose.connect(mongodbUrl, {
            useNewUrlParser: true
        })
        .then(() => {
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
    });

    it('Post invalid', function(done){
        sinon.stub(validator, 'validate').returns([1]);

        feedController.createPost({}, {}, () => {}).then((result) => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 422);
        })
        .then(() => {
            done();
            validator.validate.restore();
        });
        
    });

    it('Should return a result that user have posts length 1 if successed', function(done){
        const req = {
            body: {
                title: 'item',
                content: 'good item'
            },
            userId: '5c9a1c4e1452f12db91e1d12'
        };

        const res = {
            status: function(){
                return this;
            },
            json: function(){}
        }

        sinon.stub(validator, 'validate').returns([]);

        feedController.createPost(req, res, () => {}).then((result) => {
            expect(result).to.have.property('posts');
            expect(result.posts).to.have.length(1);
        })
        .then(() => {
            done();
            validator.validate.restore();
        });
    })

    after(function(done) {
        User.deleteMany({})
            .then(() => {
                return Post.deleteMany({})
            })
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});

describe('User get update delete posts', function(){
    before(function(done){
        let mongodbUrl = 'mongodb://127.0.0.1:27017/test-login';
        mongoose.connect(mongodbUrl, {
            useNewUrlParser: true
        })
        .then(() => {
            const post = new Post({
                title: 'Item',
                content: 'Good item',
                creator: '5c9a1c4e1452f12db91e1d12',
                _id: '5ca32b4b2f606f5cebbe57bf'
            })
            return post.save();
        })
        .then(() => {
            done();
        })
    });

    describe('Get Post', function(){
        it('Should get posts', function(done){
            const res = {
                result: null,
                status: function(){
                    return this;
                },
                json: function(data){
                    this.result = data;
                }
            };
    
            feedController.getPosts({}, res, () => {}).then(() => {
                expect(res.result).to.have.property('posts');
                expect(res.result.posts).to.have.length(1);
            })
            .then(() => {
                done();
            });
    
        })
    })
    
    describe('Update Post', function(){
        it('Update post invalid', function(done){
        
            sinon.stub(validator, 'validate').returns([1]);
    
            feedController.updatePost({}, {}, () => {}).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 422);
            })
            .then(() => {
                done();
                validator.validate.restore();
            });
    
        });
    
        it('Post not found', function(done){
    
            const req = {
                params: {
                    postId: '5ca32b4b2f606f5cebbe57bf'
                }
            };
    
            sinon.stub(Post, 'findById').returns(null);
    
            feedController.updatePost(req, {}, () => {}).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 404);
            })
            .then(() => {
                done();
                Post.findById.restore();
            });
    
        });
    
        it('Not post owner', function(done){
            
            const req = {
                params: {
                    postId: '5ca32b4b2f606f5cebbe57bf'
                },
                userId: '5c9a1c4e1452f12db9112345'
            }
    
            feedController.updatePost(req, {}, () => {}).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 403);
            })
            .then(() => {
                done();
            });
    
        });
    
        it('Should update post', function(done){
            const req = {
                params: {
                    postId: '5ca32b4b2f606f5cebbe57bf'
                },
                body: {
                    title: 'updateItem',
                    content: 'updateContent'
                },
                userId: '5c9a1c4e1452f12db91e1d12'
            }
    
            const res = {
                statusCode: 500,
                result: null,
                status: function(code){
                    this.statusCode = code;
                    return this;
                },
                json: function(data){
                    this.result = data;
                }
            };
    
            feedController.updatePost(req, res, () => {}).then(() => {
                expect(res).to.have.property('statusCode', 200);
            })
            .then(() => {
                done();
            });
        });
    })

    describe('Delete Post', function(){
        it('Post not found', function(done){
            const req = {
                params: {
                    postId: '5ca32b4b2f606f5cebbe57bf'
                }
            }

            sinon.stub(Post, 'findById').returns(null);

            feedController.deletePost(req, {}, () => {}).then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 404);
            }).then(() => {
                done();
                Post.findById.restore();
            })
        });

        it('Not post owner', function(done){
            const req = {
                params: {
                    postId: '5ca32b4b2f606f5cebbe57bf'
                },
                userId: '5c9a1c4e1452f12db9112345'
            }

            feedController.deletePost(req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 403);
            })
            .then(() => {
                done();
            })
        });

        it('Should delete post', function(done){
            const req = {
                params: {
                    postId: '5ca32b4b2f606f5cebbe57bf'
                },
                body: {
                    title: 'updateItem',
                    content: 'updateContent'
                },
                userId: '5c9a1c4e1452f12db91e1d12'
            }

            const res = {
                statusCode: 500,
                message: '',
                status: function(code){
                    this.statusCode = code;
                    return this.message;
                },
                json: function(data){
                    this.message = data;
                }
            }

            const user = new User({
                email: 'test@test.com',
                password: '123123',
                name: 'Test',
                posts: [],
                _id: '5c9a1c4e1452f12db91e1d12'
            })
            
            user.save().then(() => {
                feedController.deletePost(req, res, () => {}).then(() => {
                    expect(res).to.have.property('statusCode', 200);
                })
            }).then(() => {
                done();
            });
        });
    })

    after(function(done) {
        User.deleteMany({})
            .then(() => {
                return Post.deleteMany({})
            })
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
})