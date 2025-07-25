const userRoute = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const middleware = require('../utils/middleware')

userRoute.post('/', middleware.antiSpamMiddleware, async(req, res) => {
    const body = req.body
    if (!body.password || body.password < 3){
        return res.status(400).json({error: 'password must be at least 3 characters long'})
    }
    const saltRounds = 10
    const password = await bcrypt.hash(body.password,saltRounds)
    const newUser = new User({
        email: body.email,
        name: body.name,
        passwordhash: password
    })
    const responseDb = await newUser.save()
    res.status(201).json(responseDb)
    console.log("creado user: ", newUser.email)
})

userRoute.delete('/:id', middleware.userExtractor, async(req, res) => {
    const user =  await User.findById(req.params.id)
    if (!user){
        return res.status(404).end()
    }
    if (req.user._id.toString()  !== user._id.toString()) {
        return res.status(401).json({ error: 'unauthorized user' })
    }
    await User.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

module.exports = userRoute