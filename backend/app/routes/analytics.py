from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.database_models import Bin, BinReading, Collection, Complaint
from app.utils.database import get_db
from datetime import datetime, timedelta
from geopy.distance import geodesic

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(area_name: str = None, db: Session = Depends(get_db)):
    """Get overall dashboard statistics, optionally filtered by area"""
    
    # Base query for bins
    bin_query = db.query(Bin)
    if area_name:
        bin_query = bin_query.filter(Bin.area_name == area_name)
    
    total_bins = bin_query.count()
    bin_ids = [b.bin_id for b in bin_query.all()]
    
    if not bin_ids:
        return {
            "total_bins": 0,
            "bins_needing_collection": 0,
            "waste_collected_today_kg": 0,
            "active_complaints": 0,
            "average_fill_level": 0
        }

    # Latest readings subquery
    from sqlalchemy.sql import func as sql_func
    subquery = db.query(
        BinReading.bin_id,
        sql_func.max(BinReading.timestamp).label('max_timestamp')
    ).filter(BinReading.bin_id.in_(bin_ids)).group_by(BinReading.bin_id).subquery()
    
    # Bins needing collection (>80% full)
    high_fill_count = db.query(func.count(BinReading.id)).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).filter(BinReading.fill_level_percent >= 80).scalar() or 0
    
    # Total waste collected today
    today = datetime.utcnow().date()
    waste_today = db.query(func.sum(Collection.waste_collected_kg)).filter(
        Collection.bin_id.in_(bin_ids),
        func.date(Collection.collection_timestamp) == today
    ).scalar() or 0
    
    # Active complaints
    complaint_query = db.query(func.count(Complaint.id)).filter(
        Complaint.status.in_(['open', 'in_progress'])
    )
    if area_name:
        complaint_query = complaint_query.filter(Complaint.area_name == area_name)
    else:
        complaint_query = complaint_query.filter(Complaint.bin_id.in_(bin_ids))
        
    active_complaints = complaint_query.scalar() or 0
    
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
def get_fill_level_trends(area_name: str = None, days: int = 7, db: Session = Depends(get_db)):
    """Get fill level trends over time, optionally filtered by area"""
    since = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(
        func.date(BinReading.timestamp).label('date'),
        func.avg(BinReading.fill_level_percent).label('avg_fill')
    )
    
    if area_name:
        query = query.join(Bin, Bin.bin_id == BinReading.bin_id).filter(Bin.area_name == area_name)
    
    trends = query.filter(
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

@router.get("/alerts")
def get_alerts(area_name: str = None, db: Session = Depends(get_db)):
    """Get active alerts for critical bin conditions, optionally filtered by area"""
    
    # Base query for bins
    bin_query = db.query(Bin)
    if area_name:
        bin_query = bin_query.filter(Bin.area_name == area_name)
    bin_ids = [b.bin_id for b in bin_query.all()]

    if not bin_ids:
        return []

    # Get latest readings for filtered bins
    from sqlalchemy.sql import func as sql_func
    subquery = db.query(
        BinReading.bin_id,
        sql_func.max(BinReading.timestamp).label('max_timestamp')
    ).filter(BinReading.bin_id.in_(bin_ids)).group_by(BinReading.bin_id).subquery()
    
    critical_readings = db.query(BinReading).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).filter(BinReading.fill_level_percent >= 85).all()
    
    alerts = []
    for r in critical_readings:
        alerts.append({
            "id": f"alert-{r.bin_id}-{int(r.timestamp.timestamp())}",
            "type": "critical",
            "bin_id": r.bin_id,
            "message": f"Critical fill level: {round(r.fill_level_percent)}%",
            "timestamp": r.timestamp,
            "severity": "high"
        })
        
    return sorted(alerts, key=lambda x: x['timestamp'], reverse=True)

@router.get("/map/bins")
def get_bins_for_map(area_name: str = None, db: Session = Depends(get_db)):
    """Get all bins with current fill levels for map visualization, optionally filtered by area"""
    query = db.query(Bin)
    if area_name:
        query = query.filter(Bin.area_name == area_name)
    
    bins = query.all()
    bin_ids = [b.bin_id for b in bins]

    if not bin_ids:
        return []
    
    # Get latest readings
    from sqlalchemy.sql import func as sql_func
    subquery = db.query(
        BinReading.bin_id,
        sql_func.max(BinReading.timestamp).label('max_timestamp')
    ).filter(BinReading.bin_id.in_(bin_ids)).group_by(BinReading.bin_id).subquery()
    
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

@router.get("/area")
def get_area_analytics(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    db: Session = Depends(get_db)
):
    """Get waste analytics for a specific geographic area"""
    all_bins = db.query(Bin).all()
    user_coords = (lat, lng)
    
    # Filter bins by distance
    area_bin_ids = []
    for b in all_bins:
        if geodesic(user_coords, (b.latitude, b.longitude)).km <= radius_km:
            area_bin_ids.append(b.bin_id)
            
    if not area_bin_ids:
        return {
            "bin_count": 0,
            "avg_fill_level": 0,
            "waste_generated_weekly_kg": 0,
            "trends": []
        }
        
    # Latest readings for area bins
    subquery = db.query(
        BinReading.bin_id,
        func.max(BinReading.timestamp).label('max_timestamp')
    ).filter(BinReading.bin_id.in_(area_bin_ids)).group_by(BinReading.bin_id).subquery()
    
    avg_fill = db.query(func.avg(BinReading.fill_level_percent)).join(
        subquery,
        (BinReading.bin_id == subquery.c.bin_id) &
        (BinReading.timestamp == subquery.c.max_timestamp)
    ).scalar() or 0
    
    # Weekly waste (sum collections)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_waste = db.query(func.sum(Collection.waste_collected_kg)).filter(
        Collection.bin_id.in_(area_bin_ids),
        Collection.collection_timestamp >= week_ago
    ).scalar() or 0
    
    # Daily trends for the area
    trends = db.query(
        func.date(BinReading.timestamp).label('date'),
        func.avg(BinReading.fill_level_percent).label('avg_fill')
    ).filter(
        BinReading.bin_id.in_(area_bin_ids),
        BinReading.timestamp >= week_ago
    ).group_by(
        func.date(BinReading.timestamp)
    ).order_by('date').all()
    
    return {
        "bin_count": len(area_bin_ids),
        "avg_fill_level": round(avg_fill, 1),
        "waste_generated_weekly_kg": round(weekly_waste, 2),
        "trends": [
            {"date": str(t.date), "avg_fill": round(t.avg_fill, 2)}
            for t in trends
        ]
    }
