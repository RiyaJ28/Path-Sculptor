const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const csv = require("csv-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());

let locations = [
  { id: 1, name: "Small Car", coordinates: [51.505, -0.09] },
  { id: 2, name: "Large Truck", coordinates: [51.51, -0.1] },
  { id: 3, name: "Van", coordinates: [51.51, -0.12] },
];

// Endpoint to fetch vehicle data
app.get("/vehicles", (req, res) => {
  const vehicles = [];
  fs.createReadStream("./vehicles.csv")
    .pipe(csv())
    .on("data", (row) => vehicles.push(row))
    .on("end", () => res.json(vehicles));
});

// Optimize route (calls Python script)
app.post("/optimize", (req, res) => {
  const { vehicleId } = req.body;

  const pythonProcess = spawn("python3", ["../scripts/optimizer.py", vehicleId]);

  pythonProcess.stdout.on("data", (data) => {
    res.json({ routes: JSON.parse(data) });
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });
});

// Real-time location updates
io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit location updates every second
  const interval = setInterval(() => {
    locations = locations.map((loc) => ({
      ...loc,
      coordinates: [
        loc.coordinates[0] + (Math.random() - 0.5) * 0.001,
        loc.coordinates[1] + (Math.random() - 0.5) * 0.001,
      ],
    }));

    socket.emit("locationUpdate", locations);
  }, 1000);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    clearInterval(interval);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
