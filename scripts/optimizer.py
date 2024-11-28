import sys
import json
import pandas as pd

def optimize_routes(vehicle_id):
    vehicles = pd.read_csv("vehicles.csv")
    vehicle = vehicles[vehicles["id"] == int(vehicle_id)].iloc[0]

    name = vehicle["name"]
    weight = vehicle["weight"]

    if weight > 5000:  # Heavy vehicle logic
        return [{"name": f"Optimized Route for {name}", "coordinates": [51.51, -0.1]}]
    else:
        return [{"name": f"Optimized Route for {name}", "coordinates": [51.505, -0.09]}]

if __name__ == "__main__":
    vehicle_id = sys.argv[1]
    routes = optimize_routes(vehicle_id)
    print(json.dumps(routes))
