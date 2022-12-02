const jwt = require('jsonwebtoken')
const bycript = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel') 

// @dec Register new User
// @route POST /api/users
// @access Public
const registerUser = asyncHandler( async (req,res) => {
    const {name, email, password} = req.body

    if(!name || !email || !password){
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if user exits
    const userExits = await User.findOne({email})
    if(userExits) {
        res.status(400)
        throw new Error('User already exits')
    }

    // Hash password
    const salt = await bycript.genSalt(10)
    const hashPassword = await bycript.hash(password, salt)

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashPassword,
    })

    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    }else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @dec Authenticate a user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req,res) => {
    const{email ,password} = req.body

    // Check for user email
    const user = await User.findOne({email})

    if(user && (await bycript.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid credential')
    }
})

// @dec Get user data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req,res) => {
    res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = {
    registerUser,loginUser,getMe
}