from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.utils.database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    WORKER = "worker"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    area = Column(String, nullable=True)
    is_phone_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

class BinType(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    PUBLIC_SPACE = "public_space"

class BinStatus(str, enum.Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"

class Bin(Base):
    __tablename__ = "bins"
    
    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(String, unique=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    area_name = Column(String, nullable=True)
    capacity_liters = Column(Integer)
    bin_type = Column(Enum(BinType))
    sensor_type = Column(String)
    zone = Column(String)
    ward = Column(Integer)
    status = Column(Enum(BinStatus), default=BinStatus.ACTIVE)
    installation_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    readings = relationship("BinReading", back_populates="bin")
    collections = relationship("Collection", back_populates="bin")

class BinReading(Base):
    __tablename__ = "bin_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(String, ForeignKey("bins.bin_id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    fill_level_percent = Column(Float)
    weight_kg = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    battery_percent = Column(Float, nullable=True)
    
    # Relationship
    bin = relationship("Bin", back_populates="readings")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, index=True)
    vehicle_type = Column(String)
    capacity_kg = Column(Integer)
    status = Column(String, default="available")
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    
    # Relationships
    gps_logs = relationship("GPSLog", back_populates="vehicle")
    collections = relationship("Collection", back_populates="vehicle")

class GPSLog(Base):
    __tablename__ = "gps_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.vehicle_id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    speed_kmh = Column(Float)
    status = Column(String)
    
    # Relationship
    vehicle = relationship("Vehicle", back_populates="gps_logs")

class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(String, unique=True, index=True)
    bin_id = Column(String, ForeignKey("bins.bin_id"))
    vehicle_id = Column(String, ForeignKey("vehicles.vehicle_id"))
    collection_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    waste_collected_kg = Column(Float)
    organic_percent = Column(Float, nullable=True)
    plastic_percent = Column(Float, nullable=True)
    paper_percent = Column(Float, nullable=True)
    metal_percent = Column(Float, nullable=True)
    glass_percent = Column(Float, nullable=True)
    other_percent = Column(Float, nullable=True)
    duration_minutes = Column(Float)
    crew_size = Column(Integer)
    
    # Relationships
    bin = relationship("Bin", back_populates="collections")
    vehicle = relationship("Vehicle", back_populates="collections")

class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class ComplaintType(str, enum.Enum):
    OVERFLOWING_BIN = "overflowing_bin"
    MISSED_PICKUP = "missed_pickup"
    ILLEGAL_DUMPING = "illegal_dumping"
    BROKEN_BIN = "broken_bin"
    FOUL_ODOR = "foul_odor"
    LITTERING = "littering"
    REQUEST_NEW_BIN = "request_new_bin"

class Complaint(Base):
    __tablename__ = "complaints"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    complaint_type = Column(Enum(ComplaintType))
    latitude = Column(Float)
    longitude = Column(Float)
    area_name = Column(String, nullable=True)
    bin_id = Column(String, ForeignKey("bins.bin_id"), nullable=True)
    description = Column(String, nullable=True)
    urgency = Column(String)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.OPEN)
    resolution_hours = Column(Float, nullable=True)
    citizen_rating = Column(Integer, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
