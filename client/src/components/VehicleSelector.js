import React, { useEffect, useState } from "react";
import axios from "axios";

const VehicleSelector = ({ setVehicle }) => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [loadingBrands, setLoadingBrands] = useState(false); // Loading state for brands
  const [loadingModels, setLoadingModels] = useState(false); // Loading state for models
  const [error, setError] = useState(null);

 //useEffect(() => {
 //  setLoadingBrands(true); // Set loading for brands when component mounts
 //  axios.get("/api/vehicles")
 //    .then((response) => {
 //      setBrands(Object.keys(response.data)); // Set the brands
 //      setLoadingBrands(false); // Stop loading when brands are fetched
 //    })
 //    .catch((err) => {
 //      setError("Failed to fetch vehicle data: " + err.message);
 //      setLoadingBrands(false);
 //    });
 //}, []);
//
 const handleBrandChange = (brand) => {
  
 //  setSelectedBrand(brand);
 //  setLoadingModels(true); // Set loading for models when brand is changed
 //  setModels([]); // Clear previously selected models when brand changes
 //  axios.get(`/api/vehicles?brand=${brand}`)
 //    .then((response) => {
 //      setModels(response.data); // Set the models based on the selected brand
 //      setLoadingModels(false); // Stop loading when models are fetched
 //    })
 //    .catch((err) => {
 //      setError("Failed to fetch models: " + err.message);
 //      setLoadingModels(false);
 //    });
 };

  return (
    <div className="row g-3">
      {error && <div className="col-12 alert alert-danger">{error}</div>}
      <div className="col">
        <select
          className="form-control"
          onChange={(e) => handleBrandChange(e.target.value)}
          value={selectedBrand}
        >
          <option value="">--Select Brand--</option>
          {loadingBrands ? (
            <option>Loading brands...</option> // Show loading text while brands are being fetched
          ) : (
            brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="col">
        <select
          className="form-control"
          onChange={(e) =>
            setVehicle({ brand: selectedBrand, model: e.target.value })
          }
          disabled={!selectedBrand || loadingModels} // Disable if no brand is selected or models are loading
        >
          <option value="">--Select Model--</option>
          {loadingModels ? (
            <option>Loading models...</option> // Show loading text while models are being fetched
          ) : (
            models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default VehicleSelector;
