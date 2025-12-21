const express = require("express");
const router = express.Router();

const journeysRoutes = require("./journeys");

router.use("/journeys", journeysRoutes);

module.exports = router;
