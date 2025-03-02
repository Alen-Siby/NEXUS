const mongoose = require('mongoose');

const guestListSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  welcomeNote: String,
  dressCode: String,
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    locationName: String
  },
  vendor: {
    type: String,
    required: true
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true
  },
  guests: [{
    name: String,
    email: String,
    phone: String,
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Declined', 'Maybe'],
      default: 'Pending'
    },
    additionalInfo: mongoose.Schema.Types.Mixed,
    qrCode: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
guestListSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('GuestList', guestListSchema); 