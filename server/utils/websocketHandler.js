import axios from "axios";
import csvParser from "./csvParser.js";

// Load vehicle data
let vehicleData = [];
(async () => {
  try {
    vehicleData = await csvParser("./data/vehicles.csv");
  } catch (error) {
    console.error("Error loading vehicle data:", error.message);
  }
})();

// Find vehicle details
const findVehicleDetails = async (brand, model) => {
  
  return vehicleData.find(
    (v) => v.Brand.toLowerCase() === brand.toLowerCase() &&
           v.Model.toLowerCase() === model.toLowerCase()
  );
 

};

// Handle WebSocket connections
const handleWebSocketConnection = (ws) => {
  ws.on("message", async (message) => {
    try {
      const { start, destination, vehicle } = JSON.parse(message);

      if (!start || !destination || !vehicle) {
        return ws.send(
          JSON.stringify({ error: "Invalid data. Provide start, destination, and vehicle." })
        );
      }
      console.log("Looking for:", vehicle.Brand, vehicle.Model);
      const vehicleDetails = await findVehicleDetails(vehicle.Brand, vehicle.Model);

      if (!vehicleDetails) {
        return ws.send(
          JSON.stringify({ error: `Vehicle ${vehicle.Brand} ${vehicle.Model} not found.` })
        );
      }

      const response = await axios.post("http://localhost:5000/optimize", {
        start,
        destination,
        vehicle: vehicleDetails,
      });

      ws.send(JSON.stringify(response.data));
    } catch (error) {
      console.error("WebSocket Error:", error.message);
      ws.send(JSON.stringify({ error: "Something went wrong." }));
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected.");
  });
};

export default handleWebSocketConnection;
