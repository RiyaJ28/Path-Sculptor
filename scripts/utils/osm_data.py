import osmnx as ox
import networkx as nx
import pandas as pd
import numpy as np

def get_road_network(center_coords, distance=5000):
    """Fetch road network using OSMnx."""
    try:
        G = ox.graph_from_point(center_coords, dist=distance, network_type="drive")
        largest_cc = max(nx.strongly_connected_components(G), key=len)
        G = G.subgraph(largest_cc).copy()
        return G
    except Exception as e:
        raise RuntimeError(f"Error fetching road network: {e}")

def get_smart_defaults(highway):
    """Set defaults for maxspeed and weight."""
    defaults = {
        "primary": {"maxspeed": 60, "lanes": 2, "weight": 1.5},
        "secondary": {"maxspeed": 50, "lanes": 1, "weight": 1.2},
        "tertiary": {"maxspeed": 40, "lanes": 1, "weight": 1.0},
        "residential": {"maxspeed": 30, "lanes": 1, "weight": 0.8},
    }
    return defaults.get(highway, {"maxspeed": 30, "lanes": 1, "weight": 0.5})

def extract_features_with_weights(G):
    """Extract and preprocess road features with weights."""
    valid_highways = ["primary", "secondary", "tertiary", "trunk", "motorway"]
    road_data = []
    
    for u, v, data in G.edges(data=True):
        # Debugging the data type
        print(f"Edge data for {u}-{v}: {data}")
        
        # Ensure data is a dictionary
        if not isinstance(data, dict):
            print(f"Skipping invalid edge data: {data}")
            continue

        # Get the highway type and ensure it's valid
        highway = data.get("highway", None)
        if highway not in valid_highways:
            continue

        # Get the defaults based on highway type
        defaults = get_smart_defaults(highway)

        # Handle 'maxspeed' which might be a list
        maxspeed = data.get("maxspeed", defaults["maxspeed"])
        if isinstance(maxspeed, list):
            maxspeed = maxspeed[0] if maxspeed else defaults["maxspeed"]
        maxspeed = int(maxspeed.split()[0]) if isinstance(maxspeed, str) else int(maxspeed)

        # Handle 'length' which is sometimes np.float64 or other types
        length = data.get("length", 0)
        if isinstance(length, np.float64):
            length = float(length)  # Ensure it's a standard float
        elif not isinstance(length, (int, float)):  # Ensure it's numeric
            length = 0

        # Handle 'lanes' which might be a list or a string
        lanes = data.get("lanes", 1)
        if isinstance(lanes, list):
            lanes = lanes[0] if lanes else 1
        elif isinstance(lanes, str):
            lanes = int(lanes)  # Convert string to int if possible
        elif not isinstance(lanes, int):
            lanes = 1  # Default to 1 lane if no valid value found
        
        # Get the road weight based on the highway type
        weight = defaults["weight"]

        # Calculate centroid based on coordinates of nodes u and v
        u_coord = (G.nodes[u]["y"], G.nodes[u]["x"])
        v_coord = (G.nodes[v]["y"], G.nodes[v]["x"])
        centroid = ((u_coord[0] + v_coord[0]) / 2, (u_coord[1] + v_coord[1]) / 2)

        road_data.append({
            "u": u,
            "v": v,
            "highway": highway,
            "maxspeed": maxspeed,
            "length": length,
            "weight": weight,
            "centroid_lat": centroid[0],
            "centroid_lon": centroid[1],
        })
    
    return pd.DataFrame(road_data)
