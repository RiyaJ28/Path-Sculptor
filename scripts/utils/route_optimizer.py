import networkx as nx
import numpy as np
import osmnx as ox
import pandas as pd


def simulate_traffic(row):
    """Simulate traffic levels (low, moderate, high)."""
    traffic_levels = {"low": 0.1, "moderate": 0.2, "high": 0.5}
    return np.random.choice(list(traffic_levels.values()))

def align_features(df):
    """Align features and calculate suitability score."""
    df["length"] = pd.to_numeric(df["length"], errors="coerce").fillna(0)
    df["maxspeed"] = pd.to_numeric(df["maxspeed"], errors="coerce").fillna(30)
    df["weight"] = pd.to_numeric(df["weight"], errors="coerce").fillna(1.0)
    df["traffic_penalty"] = df.apply(simulate_traffic, axis=1)

    df["suitability_score"] = (
        df["length"] / 100
        - df["traffic_penalty"]
        - df["maxspeed"] / df["weight"]
    )
    return df

def filter_graph_by_vehicle(G, vehicle_width):
    """Filter the graph for roads suitable for the vehicle."""
    def is_suitable(u, v, d):
        width = d.get("width", 3.0)  # Default to 3 meters
        return width >= vehicle_width

    return nx.subgraph_view(G, filter_edge=is_suitable)

def find_shortest_route(G, start_coords, dest_coords):
    """Find the shortest route using suitability scores."""
    try:
        start_node = ox.distance.nearest_nodes(G, start_coords[1], start_coords[0])
        dest_node = ox.distance.nearest_nodes(G, dest_coords[1], dest_coords[0])
        return nx.shortest_path(G, source=start_node, target=dest_node, weight="suitability_score")
    except nx.NetworkXNoPath:
        return None
    except Exception as e:
        raise RuntimeError(f"Error finding shortest route: {e}")