const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Create Post
router.post('/', async (req, res) => {
    const post = new Post(req.body);

    try {
        const savedPost = await post.save(post);
        res.status(200).json(savedPost);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update Post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (req.body.userId === post.userId) {
            await post.updateOne({
                $set: req.body,
            });
            res.status(200).json("Post has been updated");
        } else {
            return res.status(403).json("You can only update your posts!");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Delete Post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (req.body.userId === post.userId) {
            await post.deleteOne();
            res.status(200).json("Post has been deleted");
        } else {
            return res.status(403).json("You can only delete your posts!");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Get Post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json("Post not found")
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Like / Dislike Post - id is the User to follow, current user is in body
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json(`${req.body.userId} liked post - ${req.params.id}`);
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json(`${req.body.userId} disliked post - ${req.params.id}`);
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Get Timeline Posts
router.get('/timeline/all', async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId: req.body.userId });
        const followingsPosts = await Promise.all(
            currentUser.followings.map((followingId) => {
                return Post.find({ userId: followingId });
            })
        );
        res.status(200).json(userPosts.concat(...followingsPosts));
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;