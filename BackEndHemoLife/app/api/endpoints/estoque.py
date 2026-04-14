from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Estoque, TipoSanguineo
from app.schemas.schemas import Estoque as EstoqueSchema, EstoqueCreate, EstoqueUpdate

router = APIRouter()

@router.get("/", response_model=List[EstoqueSchema])
def get_estoque(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    estoque = db.query(Estoque).all()
    return estoque

@router.post("/", response_model=EstoqueSchema)
def create_estoque(
    estoque: EstoqueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if blood type already exists
    existing = db.query(Estoque).filter(Estoque.tipo_sanguineo == estoque.tipo_sanguineo).first()
    if existing:
        raise HTTPException(status_code=400, detail="Blood type already exists in inventory")

    db_estoque = Estoque(**estoque.model_dump())
    db.add(db_estoque)
    db.commit()
    db.refresh(db_estoque)
    return db_estoque

@router.get("/{tipo_sanguineo}", response_model=EstoqueSchema)
def get_estoque_by_tipo(
    tipo_sanguineo: TipoSanguineo,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    estoque = db.query(Estoque).filter(Estoque.tipo_sanguineo == tipo_sanguineo).first()
    if not estoque:
        raise HTTPException(status_code=404, detail="Blood type not found in inventory")
    return estoque

@router.put("/{tipo_sanguineo}", response_model=EstoqueSchema)
def update_estoque(
    tipo_sanguineo: TipoSanguineo,
    estoque_update: EstoqueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    estoque = db.query(Estoque).filter(Estoque.tipo_sanguineo == tipo_sanguineo).first()
    if not estoque:
        raise HTTPException(status_code=404, detail="Blood type not found in inventory")

    update_data = estoque_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(estoque, field, value)

    db.commit()
    db.refresh(estoque)
    return estoque

@router.delete("/{tipo_sanguineo}")
def delete_estoque(
    tipo_sanguineo: TipoSanguineo,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    estoque = db.query(Estoque).filter(Estoque.tipo_sanguineo == tipo_sanguineo).first()
    if not estoque:
        raise HTTPException(status_code=404, detail="Blood type not found in inventory")

    db.delete(estoque)
    db.commit()
    return {"message": "Estoque deleted successfully"}