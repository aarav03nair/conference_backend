const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  registrationNumber: String,
  name: String,
  phoneNumber: String, // New field for phone number
  email: String,       // New field for email
  bookedSlots: [{
    type: mongoose.Schema.Types.ObjectId,  // Assuming slots are stored as ObjectIds in MongoDB
    ref: 'Slot'  // Referencing the Slot model
  }]
});

module.exports = mongoose.model('User', userSchema);
