const mongoose = require("mongoose");

const journeySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Journey"
    },

    // Time tracking
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    totalDuration: {
      type: Number, // in seconds
      required: true
    },

    // Speed metrics
    averageSpeed: {
      type: Number,
      required: true
    },
    maxSpeed: {
      type: Number,
      required: true
    },
    currentSpeed: {
      type: Number,
      default: 0
    },

    // Distance
    totalDistance: {
      type: Number, // in kilometers
      required: true
    },
    distanceUnit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    },

    // Vehicle detection
    detectedVehicle: {
      type: String,
      enum: ['stationary', 'walking', 'bike', 'car', 'bus', 'train', 'flight'],
      default: 'car'
    },

    // Route data
    coordinates: [{
      lat: Number,
      lng: Number,
      timestamp: Number,
      speed: Number,
      accuracy: Number
    }],

    // Speed history (time-series data)
    speedHistory: [{
      speed: Number,
      timestamp: Number,
      location: {
        lat: Number,
        lng: Number
      }
    }],

    // Analytics
    speedDrops: [{
      timestamp: Number,
      fromSpeed: Number,
      toSpeed: Number,
      location: {
        lat: Number,
        lng: Number
      }
    }],

    speedAlerts: [{
      timestamp: Number,
      speed: Number,
      limit: Number,
      location: {
        lat: Number,
        lng: Number
      }
    }],

    // Metadata
    userId: {
      type: String,
      default: 'guest'
    },
    tags: [String],
    notes: String,

    // Journey status
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'completed'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for journey date
journeySchema.virtual('journeyDate').get(function () {
  return this.startTime;
});

// Index for faster queries
journeySchema.index({ startTime: -1 });
journeySchema.index({ userId: 1 });
journeySchema.index({ detectedVehicle: 1 });

module.exports = mongoose.model("Journey", journeySchema);
