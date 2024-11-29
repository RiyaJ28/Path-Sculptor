from flask import Flask, request, jsonify
from utils.osm_data import get_road_network, extract_features_with_weights
from utils.route_optimizer import filter_graph_by_vehicle, find_shortest_route, align_features

app = Flask(__name__)

@app.route("/optimize", methods=["POST"])
def optimize_route():
    try:
        # Parse input JSON
        data = request.json
        center_coords = tuple(data.get("center_coords"))  # (lat, lon)
        area_type = data.get("area_type", "urban")
        vehicle_width = float(data.get("vehicle").get("Width")) / 1000.0  # Convert mm to meters
        start_coords = tuple(data.get("start_coords"))  # Start coordinates (lat, lon)
        dest_coords = tuple(data.get("destination_coords"))  # Destination coordinates (lat, lon)

        if not center_coords or not isinstance(center_coords, tuple):
            return jsonify({"error": "Invalid or missing center coordinates."}), 400

        # Fetch road network
        radius = 5000 if area_type == "urban" else 20000
        G = get_road_network(center_coords, distance=radius)

        # Extract road features
        road_df = extract_features_with_weights(G)
        if road_df.empty:
            return jsonify({"error": "No road data found for the specified area."}), 400

        road_df = align_features(road_df)

        # Filter graph based on vehicle width
        G_filtered = filter_graph_by_vehicle(G, vehicle_width)

        # Find the shortest route using suitability scores
        route = find_shortest_route(G_filtered, start_coords, dest_coords)
        if not route:
            return jsonify({"error": "No feasible route found."}), 400

        # Convert route to coordinates for frontend
        route_coords = [(G.nodes[node]["y"], G.nodes[node]["x"]) for node in route]
        return jsonify({"route": route_coords})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)