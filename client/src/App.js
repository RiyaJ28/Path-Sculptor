import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
//import "bootstrap/dist/css/bootstrap.min.css";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const App = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setSource(`${latitude},${longitude}`);
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  }, []);

  // Fetch brands on load
  useEffect(() => {
    axios.get('http://localhost:5000/brands')
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => {
        console.error('Error fetching brands:', error);
      });
  }, []);

  // Fetch models based on selected brand
  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);

    axios.get(`http://localhost:5000/models?brand=${brand}`)
      .then((response) => {
        setModels(response.data);
      })
      .catch((error) => {
        console.error('Error fetching models:', error);
      });
  };


  const FlyToLocation = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
      if (coords) {
        map.flyTo(coords, 17);
      }
    }, [coords, map]);
    return null;
  };

  const handleGeocoding = async (address, type) => {
    try {
      const response = await fetch(
        `http://localhost:5000/geocode?address=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.lat && data.lng) {
        if (type === "source") {
          setSource(`${data.lat},${data.lng}`); // Use coordinates for source
        } else if (type === "destination") {
          setDestinationCoords([data.lat, data.lng]); // Use coordinates for destination
        }
      } else {
        alert("Place not found, please try another name.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const fetchRoute = async () => {
    if (!source || !destinationCoords) {
      alert("Please provide both source and destination.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/directions?origin=${source}&destination=${destinationCoords[0]},${destinationCoords[1]}&mode=driving`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = polyline.decode(points); // Decode the polyline
        setRoute(decodedPoints);
      } else {
        alert("No route found.");
      }
    } catch (error) {
      console.error("Directions error:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4 p-4 bg-light">
          <h4>Route Planner</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRoute();
            }}
          >
            <div className="mb-3">
              <label>Brand</label>
              <select
                className="form-control"
                onChange={handleBrandChange}
                value={selectedBrand}
              >
                <option value="">Select Brand</option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <div className="form-group">
                <label>Model</label>
                <select
                  className="form-control"
                  onChange={(e) => setSelectedModel(e.target.value)}
                  value={selectedModel}
                >
                  <option value="">Select Model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="source" className="form-label">
                Source
              </label>
              <input
                type="text"
                id="source"
                className="form-control"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                onBlur={() => handleGeocoding(source, "source")} // Convert to geocode on blur
              />
            </div>

            <div className="mb-3">
              <label htmlFor="destination" className="form-label">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                className="form-control"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onBlur={() => handleGeocoding(destination, "destination")} // Convert to geocode on blur
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Get Route
            </button>
          </form>
        </div>

        <div className="col-md-8">
          <MapContainer
            center={currentLocation}
            zoom={13}
            style={{ height: "100vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <FlyToLocation coords={destinationCoords || currentLocation} />
            <Marker position={currentLocation}>
              <Popup>Your Location</Popup>
            </Marker>
            {destinationCoords && (
              <Marker position={destinationCoords}>
                <Popup>Destination</Popup>
              </Marker>
            )}
            {route.length > 0 && (
              <Polyline
                positions={route.map((point) => [point[0], point[1]])}
                color="blue"
                weight={3}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default App;
