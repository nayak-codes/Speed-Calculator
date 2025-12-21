const express = require("express");
const router = express.Router();
const Journey = require("../models/Journey");

// GET all journeys with optional filters
router.get("/", async (req, res) => {
  try {
    const {
      vehicleType,
      startDate,
      endDate,
      minDistance,
      limit = 50,
      sort = '-startTime'
    } = req.query;

    // Build query
    let query = {};

    if (vehicleType) {
      query.detectedVehicle = vehicleType;
    }

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    if (minDistance) {
      query.totalDistance = { $gte: parseFloat(minDistance) };
    }

    const journeys = await Journey.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .select('-speedHistory -coordinates'); // Exclude large arrays for list view

    res.status(200).json({
      success: true,
      count: journeys.length,
      data: journeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET single journey by ID
router.get("/:id", async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    res.status(200).json({
      success: true,
      data: journey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST new journey
router.post("/", async (req, res) => {
  try {
    const journey = new Journey(req.body);
    const savedJourney = await journey.save();

    res.status(201).json({
      success: true,
      data: savedJourney
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT update journey
router.put("/:id", async (req, res) => {
  try {
    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    res.status(200).json({
      success: true,
      data: journey
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE journey
router.delete("/:id", async (req, res) => {
  try {
    const journey = await Journey.findByIdAndDelete(req.params.id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journey deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET journey statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await Journey.aggregate([
      {
        $group: {
          _id: null,
          totalJourneys: { $sum: 1 },
          totalDistance: { $sum: '$totalDistance' },
          totalDuration: { $sum: '$totalDuration' },
          avgSpeed: { $avg: '$averageSpeed' },
          maxSpeedEver: { $max: '$maxSpeed' }
        }
      }
    ]);

    const vehicleStats = await Journey.aggregate([
      {
        $group: {
          _id: '$detectedVehicle',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {},
        byVehicle: vehicleStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET similar journeys (for comparison)
router.get("/:id/similar", async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    // Find journeys with similar distance and vehicle type
    const similar = await Journey.find({
      _id: { $ne: journey._id },
      detectedVehicle: journey.detectedVehicle,
      totalDistance: {
        $gte: journey.totalDistance * 0.8,
        $lte: journey.totalDistance * 1.2
      }
    })
      .limit(5)
      .select('-speedHistory -coordinates');

    res.status(200).json({
      success: true,
      data: similar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
