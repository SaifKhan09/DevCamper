const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp')
const User = require('./User')


const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100 
  },
  text: {
    type: String,
    required: [true, 'Please add a text for the review']
  },
  rating: {
    type: Number,
    min:1,
    max:10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({bootcamp:1,user:1},{unique:true})

ReviewSchema.statics.getAverageRating = async function(bootcampId) {

  const obj = await this.aggregate([
    {
      $match: {bootcamp: new mongoose.Types.ObjectId(bootcampId)}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: {$avg:'$rating'}
      }
    }
  ])
  if (obj && obj.length > 0 && obj[0].averageRating) {
    try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
        averageRating: obj[0].averageRating
      })
    } catch (error) {
      console.error(error)
    }
  } else {
    console.log("No courses found for bootcamp", bootcampId)
  }
}

ReviewSchema.post('save', async function(next){
  this.constructor.getAverageRating(this.bootcamp)
})

ReviewSchema.pre('deleteOne',{ document: false, query: true }, async function(next){
  const courseId = this.getQuery()._id;
  const course = await this.model.findById(courseId);
  tempCourseId = course.bootcamp
})

ReviewSchema.post('deleteOne',{document:false,query:true},async function(next){
  await this.model.getAverageRating(tempCourseId);
})

let tempCourseId = null

module.exports = mongoose.model('Review',ReviewSchema)