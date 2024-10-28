const express = require('express')
const advanceFiltering = require('../middleware/advanceFiltering')
const Review = require('../models/Review')
const {getAllReviews,getSingleReview,addReview,updateReview,deleteReview} = require('../controllers/reviews')
const {protect,authorize} = require('../middleware/auth')
const Bootcamp = require('../models/Bootcamp')


const router = express.Router({mergeParams:true});

router.route('/')
.get(advanceFiltering(Review,{path:'bootcamp',select:'name description'}),getAllReviews)
.post(protect,authorize('user','admin'),addReview)

router.route('/:id')
.get(getSingleReview)
.put(protect,authorize('user','admin'),updateReview)
.delete(protect,authorize('user','admin'),deleteReview)

module.exports = router