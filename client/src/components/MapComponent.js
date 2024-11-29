import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ setStartCoordinates, setDestinationCoordinates }) => {
  const LocationMarker = ({ setCoordinates, label }) => {
    useMapEvents({
      click(e) {
        setCoordinates(e.latlng);
      },
    });

    return null;
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker setCoordinates={setStartCoordinates} label="Start" />
      <LocationMarker setCoordinates={setDestinationCoordinates} label="Destination" />
    </MapContainer>
  );
};

export default MapComponent;
