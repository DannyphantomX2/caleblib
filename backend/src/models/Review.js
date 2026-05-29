const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// One review per user per resource
reviewSchema.index({ resource: 1, reviewer: 1 }, { unique: true });

// Update resource average rating after save
reviewSchema.post('save', async function() {
  const Resource = mongoose.model('Resource');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { resource: this.resource } },
    { $group: { _id: '$resource', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Resource.findByIdAndUpdate(this.resource, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
