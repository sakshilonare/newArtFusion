const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    phototitle: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User model
      ref: 'User', // The model to use for population
      required: true,
    },
    photoDescription: {
      type: String,
    },
    photo: {
      type: String,
      required: true,
    },
    forSale: {
      type: Boolean,
      default: false, // Set to false by default
    },
    price: {
      type: Number,
      default: null, // You can set a default price if needed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Upload", uploadSchema);