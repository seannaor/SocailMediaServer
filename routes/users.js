const router = require('express').Router();
const User = require('../models/User');

// Update User
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        // User try to update password
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                return res.status(500).json(error);
            }
        }
        try {
            await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

// Delete User
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

// Get User
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            const { password, updatedAt, ...relevantData } = user._doc;
            res.status(200).json(relevantData);
        } else {
            res.status(404).json("User not found")
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Follow User - id is the User to follow, current user is in body
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const currentUser = await User.findById(req.body.userId);
            const followedUser = await User.findById(req.params.id);
            if (followedUser && !followedUser.followers.includes(req.body.userId)) {
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                await user.updateOne({ $push: { followers: req.body.userId } });
                res.status(200).json(`${req.body.userId} followed ${req.params.id}`);
            } else {
                res.status(404).json("User not found or you are already following the user")
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("Can't follow yourself");
    }
});

// Unfollow User - id is the User to follow, current user is in body
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const currentUser = await User.findById(req.body.userId);
            const followedUser = await User.findById(req.params.id);
            if (followedUser && followedUser.followers.includes(req.body.userId)) {
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                await user.updateOne({ $pull: { followers: req.body.userId } });
                res.status(200).json(`${req.body.userId} unfollowed ${req.params.id}`);
            } else {
                res.status(404).json("User not found or you are not following the user")
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    } else {
        return res.status(403).json("Can't unfollow yourself");
    }
});

module.exports = router;