const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    condition: {
      type: String,
      enum: ['New', 'Used'],
      default: 'Used'
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    description: { type: String },
    specs: { type: Object, default: {} },
    imageUrl: { 
        type: String, 
        default: "https://placehold.co/600x400?text=No+Image" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);