import express from 'express';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load CSV Data
const vehicles = [];
const csvFilePath = path.join('../server/data/vehicles.csv'); // Adjust path as necessary

fs.createReadStream(csvFilePath)
  .pipe(csvParser())
  .on('data', (row) => vehicles.push(row))
  .on('end', () => {
    console.log('CSV file successfully loaded');
  });

// Get list of unique vehicle brands
app.get('/brands', (req, res) => {
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.Brand))];
  res.json(brands);
});

// Get models for a specific brand
app.get('/models', (req, res) => {
  const { brand } = req.query;
  if (!brand) {
    return res.status(400).json({ error: 'Brand is required' });
  }

  const models = vehicles.filter((vehicle) => vehicle.Brand === brand);
  const modelList = models.map((vehicle) => ({
    id: vehicle.id,
    model: vehicle.Model,
    width: vehicle.Width,
    height: vehicle.Height,
    length: vehicle.Length,
  }));
  res.json(modelList);
});

// Route for Google Geocoding API
app.get("/geocode", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Missing required query parameter: address" });
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      res.json(location); // Return the latitude and longitude
    } else {
      res.status(404).json({ error: "Address not found" });
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Directions API (can be extended to consider vehicle size)
app.get("/directions", async (req, res) => {
  const { origin, destination, mode } = req.query;

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching directions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


