
const validator = require('../utili/validator');

const Post = require('../models/post');
const User = require('../models/user');


exports.getPosts = async (req, res, next) => {

    try{
        const posts = await Post.find();
        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts
        });

    }catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
        return err;
      }
}

exports.createPost = async (req, res, next) => {
    try{
        const error = validator.validate(req);

        if(error.length !== 0){
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = error;
            throw error;
        }

        const title = req.body.title;
        const content = req.body.content;

        const post = new Post({
            title: title,
            content: content,
            creator: req.userId
        });

        await post.save();

        const user = await User.findById(req.userId);
        user.posts.push(post);
        const saveUser = await user.save();

        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { _id: user._id, name: user.name }
        });

        return saveUser;
    }catch(err){
        if(!err.statusCode)
            err.statusCode = 500;

        next(err);
        return err;
    }
};

exports.updatePost = async (req, res, next) => {
    try{
        const error = validator.validate(req);
        if(error.length !== 0){
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = error;
            throw error;
        }

        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if(!post){
            const error = new Error('Post not found');
            error.statusCode = 404;
            error.data = error;
            throw error;
        }

        if(post.creator.toString() !== req.userId.toString()){
            const error = new Error('Not Authenticated!');
            error.statusCode = 403;
            error.data = error;
            throw error;
        }

        const title = req.body.title;
        const content = req.body.content;

        post.title = title;
        post.content = content;
        const result = post.save();

        res.status(200).json({message: 'Update Successfull!', post: result});
    }catch(err){
        if(!err.statusCode)
            err.statusCode = 500;

        next(err);
        return err;
    }
}

exports.deletePost = async (req, res, next) => {
    try{
        const postId = req.params.postId;
        const post = await Post.findById(postId);

        if(!post){
            const error = new Error('Post not found!');
            error.statusCode = 404;
            error.data = error;
            throw error;
        }

        if(post.creator.toString() !== req.userId){
            const error = new Error('Not Authenticated');
            error.statusCode = 403;
            error.data = error;
            throw error;
        }

        await Post.findByIdAndDelete(postId);

        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        res.status(200).json({message: 'Delete Successed', })
    }catch(err){
        if(!err.statusCode)
            err.statusCode = 500;

        next(err);
        return err;
    }
}