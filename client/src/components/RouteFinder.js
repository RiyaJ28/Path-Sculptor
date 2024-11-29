import React, { useState } from "react";
import axios from "axios";

const RouteFinder = ({ startCoordinates, destinationCoordinates, selectedVehicle }) => {
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  const findRoute = () => {
    if (!startCoordinates || !destinationCoordinates || !selectedVehicle) {
      setError("Please select all fields.");
      return;
    }

    setError(null);

    const data = {
      start: startCoordinates,
      destination: destinationCoordinates,
      vehicle: selectedVehicle,
    };

    axios
      .post("/api/find-route", data)
      .then((response) => {
        setRoute(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to find a route.");
      });
  };

  return (
    <div>
      <h2>Find Route</h2>
      <button onClick={findRoute}>Find Route</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {route && (
        <div>
          <h3>Optimized Route</h3>
          <pre>{JSON.stringify(route, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RouteFinder;
