from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.database_models import Collection, Bin
from app.models.schemas import CollectionCreate, CollectionResponse
from app.utils.database import get_db
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=List[CollectionResponse])
def get_collections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all collections"""
    collections = db.query(Collection).order_by(
        desc(Collection.collection_timestamp)
    ).offset(skip).limit(limit).all()
    return collections

@router.post("/", response_model=CollectionResponse)
def create_collection(collection: CollectionCreate, db: Session = Depends(get_db)):
    """Record a new collection"""
    db_collection = Collection(**collection.dict())
    db.add(db_collection)
    db.commit()
    db.refresh(db_collection)
    return db_collection

@router.get("/stats/daily")
def get_daily_stats(days: int = 7, db: Session = Depends(get_db)):
    """Get daily collection statistics"""
    since = datetime.utcnow() - timedelta(days=days)
    
    daily_stats = db.query(
        func.date(Collection.collection_timestamp).label('date'),
        func.count(Collection.id).label('total_collections'),
        func.sum(Collection.waste_collected_kg).label('total_waste_kg'),
        func.avg(Collection.duration_minutes).label('avg_duration')
    ).filter(
        Collection.collection_timestamp >= since
    ).group_by(
        func.date(Collection.collection_timestamp)
    ).all()
    
    return [
        {
            "date": str(stat.date),
            "total_collections": stat.total_collections,
            "total_waste_kg": round(stat.total_waste_kg, 2) if stat.total_waste_kg else 0,
            "avg_duration": round(stat.avg_duration, 2) if stat.avg_duration else 0
        }
        for stat in daily_stats
    ]

@router.get("/stats/composition")
def get_waste_composition(db: Session = Depends(get_db)):
    """Get average waste composition"""
    avg_composition = db.query(
        func.avg(Collection.organic_percent).label('organic'),
        func.avg(Collection.plastic_percent).label('plastic'),
        func.avg(Collection.paper_percent).label('paper'),
        func.avg(Collection.metal_percent).label('metal'),
        func.avg(Collection.glass_percent).label('glass'),
        func.avg(Collection.other_percent).label('other')
    ).first()
    
    return {
        "organic": round(avg_composition.organic, 1) if avg_composition.organic else 0,
        "plastic": round(avg_composition.plastic, 1) if avg_composition.plastic else 0,
        "paper": round(avg_composition.paper, 1) if avg_composition.paper else 0,
        "metal": round(avg_composition.metal, 1) if avg_composition.metal else 0,
        "glass": round(avg_composition.glass, 1) if avg_composition.glass else 0,
        "other": round(avg_composition.other, 1) if avg_composition.other else 0
    }
