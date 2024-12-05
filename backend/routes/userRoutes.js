import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import { generateToken, isAdmin, isAuth } from '../utils.js';

const userRouter = express.Router()

userRouter.get('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const users = await User.find();
    if (users) {
        res.send(users);
    } else {
        res.status(404).send({ message: 'Users Not Found' });
    }
}));

userRouter.get('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        res.send(user);
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.post('/signin', expressAsyncHandler(async (req, res) => {


    const user = await User.findOne({ email: req.body.email });
    if (user == null) console.log("null user");


    if (user) {

        if (bcrypt.compareSync(req.body.password, user.password)) {

            res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user)
            })
            return;
        }

    }
    res.status(401).send({ message: 'Invalid email or password' });
}))
userRouter.post('/signup', expressAsyncHandler(async (req, res) => {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password)
    });
    const user = await newUser.save();
    res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user)
    })
}));

userRouter.put('/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = Boolean(req.body.isAdmin);

        const updateUser = await user.save();
        res.send({ message: "User Updated", user: updateUser });
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {


    const user = await User.findById(req.user._id)
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 8);
        }
        const updateUser = await user.save();
        res.send({
            _id: updateUser._id,
            name: updateUser.name,
            email: updateUser.email,
            isAdmin: updateUser.isAdmin,
            token: generateToken(updateUser)
        })
    } else {
        res.status(404).send({ message: 'User Not Found' })
    }
}));

userRouter.delete('/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if(user){
        if(user.isAdmin === true){
            res.status(400).send({ message: 'Can not delete admin user' });
            return;
        }
        await user.deleteOne();
        res.send({message:"User deleted"})
    }else{
        res.status(404).send({ message: 'User Not Found' })
    }
}));

export default userRouter;