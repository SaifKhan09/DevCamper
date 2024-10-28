const express = require('express')
const router = express.Router();

const {getBootcamp,getBootcamps,updateBootcamp,createBootcamp,deleteBootcamps,getBootcampsByRadius,bootcampPhotoUpload} = require('../controllers/bootcamps')

// Include routes for other resources
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');
const Bootcamp = require('../models/Bootcamp')
const advanceFiltering = require('../middleware/advanceFiltering');
const {protect,authorize} = require('../middleware/auth');

// Re-reoute to other resources route
router.use('/:bootcampId/courses',courseRouter)
router.use('/:bootcampId/reviews',reviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius)

router.route('/').get(advanceFiltering(Bootcamp,'courses'),getBootcamps).post(protect,authorize('publisher','admin'),createBootcamp)

router.route('/:id').get(getBootcamp).put(protect,authorize('publisher','admin'),updateBootcamp).delete(protect,authorize('publisher','admin'),deleteBootcamps)

router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload)

module.exports = router