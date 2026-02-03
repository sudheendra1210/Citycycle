from geopy.distance import geodesic
from typing import List
import random

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers"""
    return geodesic((lat1, lon1), (lat2, lon2)).kilometers

def optimize_collection_route(vehicle_id: str, bins: List):
    """
    Optimize collection route using nearest neighbor heuristic
    In production, use more sophisticated algorithms (OR-Tools, genetic algorithms)
    """
    
    if not bins:
        return {
            "vehicle_id": vehicle_id,
            "bins_to_collect": [],
            "total_distance_km": 0,
            "estimated_duration_minutes": 0,
            "optimized_sequence": []
        }
    
    # Depot location (starting point) - using first bin as depot for simplicity
    depot_lat, depot_lon = 28.6139, 77.2090
    
    # Nearest neighbor algorithm
    unvisited = bins.copy()
    route = []
    current_lat, current_lon = depot_lat, depot_lon
    total_distance = 0
    
    while unvisited:
        # Find nearest bin
        nearest_bin = None
        min_distance = float('inf')
        
        for bin in unvisited:
            dist = calculate_distance(current_lat, current_lon, bin.latitude, bin.longitude)
            if dist < min_distance:
                min_distance = dist
                nearest_bin = bin
        
        # Add to route
        route.append(nearest_bin)
        total_distance += min_distance
        current_lat, current_lon = nearest_bin.latitude, nearest_bin.longitude
        unvisited.remove(nearest_bin)
    
    # Return to depot
    total_distance += calculate_distance(current_lat, current_lon, depot_lat, depot_lon)
    
    # Estimate duration (assuming 30 km/h average speed + 5 min per bin)
    travel_time = (total_distance / 30) * 60  # minutes
    collection_time = len(route) * 5  # 5 minutes per bin
    total_duration = travel_time + collection_time
    
    # Build optimized sequence
    optimized_sequence = []
    for i, bin in enumerate(route):
        optimized_sequence.append({
            "sequence": i + 1,
            "bin_id": bin.bin_id,
            "latitude": bin.latitude,
            "longitude": bin.longitude,
            "bin_type": bin.bin_type.value,
            "zone": bin.zone
        })
    
    return {
        "vehicle_id": vehicle_id,
        "bins_to_collect": [bin.bin_id for bin in route],
        "total_distance_km": round(total_distance, 2),
        "estimated_duration_minutes": round(total_duration, 2),
        "optimized_sequence": optimized_sequence
    }
