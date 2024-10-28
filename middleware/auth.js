const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResoponse')

exports.protect = asyncHandler(async (req,res,next)=>{
    let token;
    // Set token from Bearer Token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    // Set token from cookie
    // else if(req.cookies.token){
    //     token = req.cookies.token
    // }

    if(!token){
        next(new ErrorResponse('Not Authorized to access this route',401))
    }

    try{
        // Verify Token
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log(decoded)

        req.user = await User.findById(decoded['id'])
        next();
    }
    catch (err){
        next(new ErrorResponse('Not Authorized to access this route',401))
    }
})

exports.authorize = (...roles) => {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorResponse(`User Role ${req.user.role} is not Authorized to access this route`,403)
            )
        }
        next()
    }
}