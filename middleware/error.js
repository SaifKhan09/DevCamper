const ErrorResponse = require('../utils/errorResoponse')

const errorHandler = (err,req,res,next) => {
    let error = {...err}
    error.message = err.message

    console.log(err)

    if(error.message && error.message.includes('Cast to ObjectId failed')){
        const message = `Resource with id : ${error.value} not found`
        error = new ErrorResponse(message,404)
    }

    if(error.code && error.code === 11000){
        const message = `Duplicate field value entered`
        error = new ErrorResponse(message,404)
    }

    if(error.message && error.message.includes('validation failed')){
        const message = Object.values(err.errors).map(val => val.message)
        error = new ErrorResponse(message,404)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        data: error.message || 'Server Error'
    })
}

module.exports = errorHandler