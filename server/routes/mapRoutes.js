import express from "express";
import csvParser from "../utils/csvParser.js";
import axios from "axios";

const router = express.Router();

// Load vehicle data asynchronously
let vehicleData = [];
const loadVehicleData = async () => {
  try {
    vehicleData = await csvParser("./data/vehicles.csv");
    console.log("Vehicle data loaded successfully.");
  } catch (error) {
    console.error("Failed to load vehicle data:", error.message);
  }
};

// Initial vehicle data load
loadVehicleData();

// Route: Fetch available brands and models
router.get("/vehicles", (req, res) => {
  if (vehicleData.length === 0) {
    return res.status(500).json({ error: "Vehicle data not loaded yet. Please try again later." });
  }

  const { brand } = req.query;

  if (brand) {
    const models = vehicleData
      .filter(vehicle => vehicle.Brand === brand)
      .map(vehicle => vehicle.Model);
    return res.send(models);
  }

  const brands = vehicleData.reduce((acc, vehicle) => {
    if (!acc[vehicle.Brand]) acc[vehicle.Brand] = [];
    acc[vehicle.Brand].push(vehicle.Model);
    return acc;
  }, {});

  res.send(brands);
});


// Route: Geocode an address
router.post("/geocode", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Address is required." });
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return res.status(500).json({ error: "Google Maps API key is not configured." });
  }

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const results = response.data.results;
    if (results.length === 0) {
      return res.status(404).json({ error: "Address not found." });
    }

    const { lat, lng } = results[0].geometry.location;
    res.json({ latitude: lat, longitude: lng });
  } catch (error) {
    console.error("Geocoding API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch geocoding data." });
  }
});

// Route: Reload vehicle data
router.post("/reload-vehicles", async (req, res) => {
  try {
    await loadVehicleData();
    res.json({ message: "Vehicle data reloaded successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reload vehicle data." });
  }
});

export default router;
