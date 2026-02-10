from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

# Enums
class BinTypeEnum(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    PUBLIC_SPACE = "public_space"

class BinStatusEnum(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"

class ComplaintTypeEnum(str, Enum):
    OVERFLOWING_BIN = "overflowing_bin"
    MISSED_PICKUP = "missed_pickup"
    ILLEGAL_DUMPING = "illegal_dumping"
    BROKEN_BIN = "broken_bin"
    FOUL_ODOR = "foul_odor"
    LITTERING = "littering"
    REQUEST_NEW_BIN = "request_new_bin"

class ComplaintStatusEnum(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

# Bin Schemas
class BinBase(BaseModel):
    bin_id: str
    latitude: float
    longitude: float
    area_name: Optional[str] = None
    capacity_liters: int
    bin_type: BinTypeEnum
    sensor_type: str
    zone: str
    ward: int

class BinCreate(BinBase):
    pass

class BinResponse(BinBase):
    id: int
    status: BinStatusEnum
    installation_date: datetime
    current_fill_level: Optional[float] = None
    last_collection: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Bin Reading Schemas
class BinReadingCreate(BaseModel):
    bin_id: str
    fill_level_percent: float
    weight_kg: Optional[float] = None
    temperature_c: Optional[float] = None
    battery_percent: Optional[float] = None

class BinReadingResponse(BinReadingCreate):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Vehicle Schemas
class VehicleBase(BaseModel):
    vehicle_id: str
    vehicle_type: str
    capacity_kg: int

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int
    status: str
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    
    class Config:
        from_attributes = True

# Collection Schemas
class CollectionCreate(BaseModel):
    collection_id: str
    bin_id: str
    vehicle_id: str
    waste_collected_kg: float
    organic_percent: Optional[float] = None
    plastic_percent: Optional[float] = None
    paper_percent: Optional[float] = None
    metal_percent: Optional[float] = None
    glass_percent: Optional[float] = None
    other_percent: Optional[float] = None
    duration_minutes: float
    crew_size: int

class CollectionResponse(CollectionCreate):
    id: int
    collection_timestamp: datetime
    
    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    complaint_type: ComplaintTypeEnum
    latitude: float
    longitude: float
    area_name: Optional[str] = None
    bin_id: Optional[str] = None
    description: Optional[str] = None
    urgency: str = "medium"

class ComplaintResponse(BaseModel):
    id: int
    complaint_id: str
    timestamp: datetime
    complaint_type: ComplaintTypeEnum
    latitude: float
    longitude: float
    area_name: Optional[str] = None
    bin_id: Optional[str] = None
    description: Optional[str] = None
    urgency: str
    status: ComplaintStatusEnum
    resolution_hours: Optional[float] = None
    citizen_rating: Optional[int] = None
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Prediction Schemas
class FillLevelPrediction(BaseModel):
    bin_id: str
    current_fill_level: float
    predicted_fill_level: float
    predicted_full_time: Optional[datetime] = None
    hours_until_full: Optional[float] = None

class RouteOptimization(BaseModel):
    vehicle_id: str
    bins_to_collect: list[str]
    total_distance_km: float
    estimated_duration_minutes: float
    optimized_sequence: list[dict]

class RouteOptimizationRequest(BaseModel):
    vehicle_id: str
    threshold: float = 80.0
