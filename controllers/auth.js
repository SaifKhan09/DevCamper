const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResoponse");
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')
const dotenv = require('dotenv')
const crypto = require('crypto')

exports.register = asyncHandler(async(req,res,next)=>{
    const {name,email,password,role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    sendTokenResponse(user,200,res)
})

exports.login = asyncHandler(async(req,res,next)=>{
    const {email,password} = req.body;

    // check if an email and password is provided
    if(!email || !password){
        return next(new ErrorResponse('Please enter an email and a password',400))
    }

    // Check for the user availability
    const user = await User.findOne({email:email}).select('+password')
    
    if(!user){
        return next(new ErrorResponse('Invalid Credentials',401))
    }

    // Check if the password is correct
    const isMatch = await user.matchPassword(password)

    if (!isMatch){
        return next(new ErrorResponse('Invalid Credentials',401))
    }

    sendTokenResponse(user,200,res)
})

exports.getMe = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id)
    res.status(200).json({success: true, data: user })
})

exports.resetPassword = asyncHandler(async (req,res,next)=>{
    // get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if(!user){
        return next(new ErrorResponse('Invalid Token',400))
    }
    // Set the New Password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    sendTokenResponse(user,200,res)
})

exports.forgotPassword = asyncHandler(async (req,res,next)=>{
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorResponse('Email not found',404))
    }

    const resetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave: false})

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are recieving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to :\n\n ${resetUrl}`

    try {
        await sendEmail({
            email: req.body.email,
            subject: 'Password Reset Token',
            message
        })
        res.status(200).json({success:true,data:'Email Sent'})
    } catch (error) {
        console.log(error)
        user.resetPasswordExpire = undefined
        user.resetPasswordToken = undefined
        await user.save({validateBeforeSave:false})
        next(new ErrorResponse('Email could not be sent',500))
    }
})

exports.updateUserDetails = asyncHandler(async (req,res,next)=>{
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new: true,
        runValidators: true
    })
    res.status(200).json({success: true, data: user })
})

exports.updatePassword = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password')
    // Check Current Password
    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is Incorrect'),401)
    }

    user.password = req.body.newPassword
    await user.save()
    sendTokenResponse(user,200,res)
})

exports.logoutUser = asyncHandler(async (req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({success: true, data: {} })
})


// Get Token from model, create cookie and send response
const sendTokenResponse = (user,statusCode,res) => {
    const token = user.getJsonWebToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options['secure'] = true
    }

    res.status(statusCode)
    .cookie('token',token,options)
    .json({success:true,token})
}
