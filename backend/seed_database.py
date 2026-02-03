"""
Data seeding script to populate database with sample data
Run this after starting the backend for the first time
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import SessionLocal
from app.models.database_models import Bin, BinReading, Vehicle, Collection, Complaint
from app.models.database_models import BinType, BinStatus, ComplaintType, ComplaintStatus
from datetime import datetime, timedelta
import random

def seed_database():
    db = SessionLocal()
    
    print("Seeding database with sample data...")
    
    # Create bins
    print("\n1. Creating bins...")
    bins_data = []
    for i in range(1, 51):
        bin = Bin(
            bin_id=f"BIN_{i:03d}",
            latitude=17.3850 + random.uniform(-0.1, 0.1),
            longitude=78.4867 + random.uniform(-0.1, 0.1),
            capacity_liters=random.choice([120, 240, 360, 660, 1100]),
            bin_type=random.choice([BinType.RESIDENTIAL, BinType.COMMERCIAL, BinType.PUBLIC_SPACE]),
            sensor_type=random.choice(['ultrasonic', 'weight', 'ultrasonic+weight']),
            zone=random.choice(['North', 'South', 'East', 'West', 'Central']),
            ward=random.randint(1, 20),
            status=BinStatus.ACTIVE
        )
        bins_data.append(bin)
        db.add(bin)
    
    db.commit()
    print(f"   ✓ Created {len(bins_data)} bins")
    
    # Create bin readings
    print("\n2. Creating bin readings...")
    readings_count = 0
    for bin in bins_data:
        current_fill = 0
        
        # Define fill rate based on bin type
        if bin.bin_type == BinType.COMMERCIAL:
            base_fill_rate = random.uniform(4, 8)  # Faster fill
        elif bin.bin_type == BinType.PUBLIC_SPACE:
            base_fill_rate = random.uniform(3, 6)
        else:  # Residential
            base_fill_rate = random.uniform(2, 4)
        
        # Generate 30 days of data for better ML training
        for day in range(30):
            # 6 readings per day (every 4 hours)
            for hour in [0, 4, 8, 12, 16, 20]:
                timestamp = datetime.utcnow() - timedelta(days=29-day, hours=24-hour)
                
                # Time-based patterns
                hour_of_day = timestamp.hour
                day_of_week = timestamp.weekday()
                
                # Peak hours (more waste generation)
                time_multiplier = 1.0
                if 8 <= hour_of_day <= 10 or 18 <= hour_of_day <= 20:
                    time_multiplier = 1.5  # Morning and evening peaks
                elif 0 <= hour_of_day <= 6:
                    time_multiplier = 0.5  # Night time, less waste
                
                # Weekend patterns
                weekend_multiplier = 1.0
                if day_of_week >= 5:  # Weekend
                    if bin.bin_type == BinType.RESIDENTIAL:
                        weekend_multiplier = 1.3  # More residential waste on weekends
                    elif bin.bin_type == BinType.COMMERCIAL:
                        weekend_multiplier = 0.7  # Less commercial waste on weekends
                
                # Calculate fill increase
                fill_increase = base_fill_rate * time_multiplier * weekend_multiplier
                fill_increase += random.gauss(0, 1)  # Add noise
                
                current_fill = min(100, current_fill + fill_increase)
                
                # Simulate collection when bin is nearly full
                if current_fill > 85 and random.random() < 0.4:
                    current_fill = random.uniform(0, 10)  # Reset after collection
                
                # Ensure fill level is valid
                current_fill = max(0, min(100, current_fill))
                
                reading = BinReading(
                    bin_id=bin.bin_id,
                    timestamp=timestamp,
                    fill_level_percent=round(current_fill + random.gauss(0, 1.5), 1),
                    weight_kg=round(current_fill * bin.capacity_liters * 0.003, 2),
                    temperature_c=round(25 + random.uniform(-5, 10), 1),
                    battery_percent=round(100 - day * 0.5 + random.uniform(-3, 3), 1)
                )
                db.add(reading)
                readings_count += 1
    
    db.commit()
    print(f"   ✓ Created {readings_count} bin readings (30 days of data)")
    
    # Create vehicles
    print("\n3. Creating vehicles...")
    vehicles_data = []
    for i in range(1, 6):
        vehicle = Vehicle(
            vehicle_id=f"TRUCK_{i:02d}",
            vehicle_type="Compactor Truck",
            capacity_kg=5000,
            status="available"
        )
        vehicles_data.append(vehicle)
        db.add(vehicle)
    
    db.commit()
    print(f"   ✓ Created {len(vehicles_data)} vehicles")
    
    # Create collections
    print("\n4. Creating collection records...")
    collections_count = 0
    for day in range(7):
        bins_to_collect = random.sample(bins_data, random.randint(20, 35))
        for bin in bins_to_collect:
            collection = Collection(
                collection_id=f"COL_{day:03d}_{bin.bin_id}",
                bin_id=bin.bin_id,
                vehicle_id=random.choice(vehicles_data).vehicle_id,
                collection_timestamp=datetime.utcnow() - timedelta(days=6-day, hours=random.randint(6, 18)),
                waste_collected_kg=round(random.uniform(20, 150), 2),
                organic_percent=round(random.uniform(30, 50), 1),
                plastic_percent=round(random.uniform(15, 30), 1),
                paper_percent=round(random.uniform(10, 20), 1),
                metal_percent=round(random.uniform(2, 8), 1),
                glass_percent=round(random.uniform(3, 10), 1),
                other_percent=round(random.uniform(5, 15), 1),
                duration_minutes=round(random.uniform(3, 10), 1),
                crew_size=random.randint(2, 4)
            )
            db.add(collection)
            collections_count += 1
    
    db.commit()
    print(f"   ✓ Created {collections_count} collection records")
    
    # Create complaints
    print("\n5. Creating citizen complaints...")
    complaints_count = 0
    for day in range(7):
        num_complaints = random.randint(3, 8)
        for _ in range(num_complaints):
            complaint = Complaint(
                complaint_id=f"CMP_{complaints_count+1:05d}",
                timestamp=datetime.utcnow() - timedelta(days=6-day, hours=random.randint(6, 22)),
                complaint_type=random.choice(list(ComplaintType)),
                latitude=17.3850 + random.uniform(-0.1, 0.1),
                longitude=78.4867 + random.uniform(-0.1, 0.1),
                urgency=random.choice(['low', 'medium', 'high']),
                status=random.choice([ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED])
            )
            db.add(complaint)
            complaints_count += 1
    
    db.commit()
    print(f"   ✓ Created {complaints_count} complaints")
    
    print("\n" + "="*60)
    print("Database seeding complete!")
    print("="*60)
    print(f"\nTotal records created:")
    print(f"  • Bins: {len(bins_data)}")
    print(f"  • Bin Readings: {readings_count}")
    print(f"  • Vehicles: {len(vehicles_data)}")
    print(f"  • Collections: {collections_count}")
    print(f"  • Complaints: {complaints_count}")
    print("\nYou can now start the backend and access the API!")
    
    db.close()

if __name__ == "__main__":
    seed_database()
