import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";
import axios from "axios";
import { useGeolocated } from "react-geolocated";

const socket = io("http://localhost:5000");

const App = () => {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState([]);

  const { coords } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    axios.get("http://localhost:5000/vehicles").then((response) => {
      setVehicles(response.data);
      const uniqueBrands = [...new Set(response.data.map((v) => v.Brand))];
      setBrands(uniqueBrands);
    });

    socket.on("locationUpdate", (data) => {
      setLocations(data);
    });

    return () => socket.off("locationUpdate");
  }, []);

  useEffect(() => {
    if (coords) {
      setCurrentLocation([coords.latitude, coords.longitude]);
    }
  }, [coords]);

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    const filteredModels = vehicles.filter((v) => v.Brand === brand).map((v) => v.Model);
    setModels(filteredModels);
    setSelectedModel("");
  };

  const fetchOptimizedRoute = async () => {
    try {
      const response = await axios.post("http://localhost:5000/optimize", {
        model: selectedModel,
        currentLocation,
        destination,
      });
      setRoute(response.data.routes); // Update route state with API response
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Real-Time Route Optimizer</h1>

      <label>Select Brand:</label>
      <select value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)}>
        <option value="">Select a Brand</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <label>Select Model:</label>
      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedBrand}>
        <option value="">Select a Model</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <label>Destination:</label>
      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Enter destination address"
      />

      <button onClick={fetchOptimizedRoute} disabled={!selectedModel || !currentLocation || !destination}>
        Optimize Route
      </button>

      <MapContainer center={currentLocation || [51.505, -0.09]} zoom={13} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        {locations.map((location) => (
          <Marker key={location.id} position={location.coordinates}>
            <Popup>{location.name}</Popup>
          </Marker>
        ))}
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default App;
