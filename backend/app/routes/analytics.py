from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.database_models import Bin, BinReading, Collection, Complaint
from app.utils.database import get_db
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    
    # Total bins
    total_bins = db.query(func.count(Bin.id)).scalar()
    
    # Bins needing collection (>80% full)
    from sqlalchemy.sql import func as sql_func
    subquery = db.query(
        BinReading.bin_id,
        sql_func.max(BinReading.timestamp).label('max_timestamp')
    ).group_by(BinReading.bin_id).subquery()
    
    high_fill_count = db.query(func.count(BinReading.id)).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).filter(BinReading.fill_level_percent >= 80).scalar()
    
    # Total waste collected today
    today = datetime.utcnow().date()
    waste_today = db.query(func.sum(Collection.waste_collected_kg)).filter(
        func.date(Collection.collection_timestamp) == today
    ).scalar() or 0
    
    # Active complaints
    active_complaints = db.query(func.count(Complaint.id)).filter(
        Complaint.status.in_(['open', 'in_progress'])
    ).scalar()
    
    # Average fill level
    avg_fill = db.query(func.avg(BinReading.fill_level_percent)).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).scalar() or 0
    
    return {
        "total_bins": total_bins,
        "bins_needing_collection": high_fill_count,
        "waste_collected_today_kg": round(waste_today, 2),
        "active_complaints": active_complaints,
        "average_fill_level": round(avg_fill, 1)
    }

@router.get("/trends/fill-levels")
def get_fill_level_trends(days: int = 7, db: Session = Depends(get_db)):
    """Get fill level trends over time"""
    since = datetime.utcnow() - timedelta(days=days)
    
    trends = db.query(
        func.date(BinReading.timestamp).label('date'),
        func.avg(BinReading.fill_level_percent).label('avg_fill')
    ).filter(
        BinReading.timestamp >= since
    ).group_by(
        func.date(BinReading.timestamp)
    ).order_by('date').all()
    
    return [
        {
            "date": str(trend.date),
            "avg_fill_level": round(trend.avg_fill, 2)
        }
        for trend in trends
    ]

@router.get("/map/bins")
def get_bins_for_map(db: Session = Depends(get_db)):
    """Get all bins with current fill levels for map visualization"""
    bins = db.query(Bin).all()
    
    # Get latest readings
    from sqlalchemy.sql import func as sql_func
    subquery = db.query(
        BinReading.bin_id,
        sql_func.max(BinReading.timestamp).label('max_timestamp')
    ).group_by(BinReading.bin_id).subquery()
    
    latest_readings = db.query(BinReading).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).all()
    
    readings_dict = {r.bin_id: r for r in latest_readings}
    
    result = []
    for bin in bins:
        reading = readings_dict.get(bin.bin_id)
        result.append({
            "bin_id": bin.bin_id,
            "latitude": bin.latitude,
            "longitude": bin.longitude,
            "capacity_liters": bin.capacity_liters,
            "bin_type": bin.bin_type.value,
            "zone": bin.zone,
            "fill_level": reading.fill_level_percent if reading else 0,
            "status": bin.status.value
        })
    
    return result
