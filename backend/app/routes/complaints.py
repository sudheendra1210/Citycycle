from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.database_models import Complaint, ComplaintStatus
from app.models.schemas import ComplaintCreate, ComplaintResponse
from app.utils.database import get_db
from typing import List
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all complaints, optionally filtered by status"""
    query = db.query(Complaint)
    
    if status:
        query = query.filter(Complaint.status == status)
    
    complaints = query.order_by(desc(Complaint.timestamp)).offset(skip).limit(limit).all()
    return complaints

@router.post("/", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    """Create a new citizen complaint"""
    complaint_id = f"CMP_{uuid.uuid4().hex[:8].upper()}"
    
    db_complaint = Complaint(
        complaint_id=complaint_id,
        **complaint.dict()
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.patch("/{complaint_id}/resolve")
def resolve_complaint(
    complaint_id: str,
    rating: int = None,
    db: Session = Depends(get_db)
):
    """Mark complaint as resolved"""
    complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = ComplaintStatus.RESOLVED
    complaint.resolved_at = datetime.utcnow()
    
    if complaint.timestamp:
        time_diff = complaint.resolved_at - complaint.timestamp
        complaint.resolution_hours = time_diff.total_seconds() / 3600
    
    if rating:
        complaint.citizen_rating = rating
    
    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("/stats/summary")
def get_complaint_stats(db: Session = Depends(get_db)):
    """Get complaint statistics"""
    from sqlalchemy import func
    
    total = db.query(func.count(Complaint.id)).scalar()
    open_count = db.query(func.count(Complaint.id)).filter(
        Complaint.status == ComplaintStatus.OPEN
    ).scalar()
    resolved_count = db.query(func.count(Complaint.id)).filter(
        Complaint.status == ComplaintStatus.RESOLVED
    ).scalar()
    
    avg_resolution = db.query(func.avg(Complaint.resolution_hours)).filter(
        Complaint.resolution_hours.isnot(None)
    ).scalar()
    
    type_counts = db.query(
        Complaint.complaint_type,
        func.count(Complaint.id).label('count')
    ).group_by(Complaint.complaint_type).all()
    
    return {
        "total": total,
        "open": open_count,
        "resolved": resolved_count,
        "avg_resolution_hours": round(avg_resolution, 2) if avg_resolution else 0,
        "by_type": {str(tc.complaint_type): tc.count for tc in type_counts}
    }
