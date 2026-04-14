from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Doacao
from app.schemas.schemas import Doacao as DoacaoSchema, DoacaoCreate, DoacaoUpdate, PaginatedResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[DoacaoSchema])
def get_doacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    total = db.query(func.count(Doacao.id)).scalar()
    doacoes = db.query(Doacao).offset(skip).limit(limit).all()

    pages = (total + limit - 1) // limit

    return {
        "data": doacoes,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "pages": pages
    }

@router.post("/", response_model=DoacaoSchema)
def create_doacao(
    doacao: DoacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if doador exists
    from app.models.models import Doador
    doador = db.query(Doador).filter(Doador.id == doacao.doador_id).first()
    if not doador:
        raise HTTPException(status_code=404, detail="Doador not found")

    db_doacao = Doacao(**doacao.model_dump())
    db.add(db_doacao)
    db.commit()
    db.refresh(db_doacao)
    return db_doacao

@router.get("/{doacao_id}", response_model=DoacaoSchema)
def get_doacao(
    doacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    doacao = db.query(Doacao).filter(Doacao.id == doacao_id).first()
    if not doacao:
        raise HTTPException(status_code=404, detail="Doacao not found")
    return doacao

@router.put("/{doacao_id}", response_model=DoacaoSchema)
def update_doacao(
    doacao_id: int,
    doacao_update: DoacaoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    doacao = db.query(Doacao).filter(Doacao.id == doacao_id).first()
    if not doacao:
        raise HTTPException(status_code=404, detail="Doacao not found")

    update_data = doacao_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doacao, field, value)

    db.commit()
    db.refresh(doacao)
    return doacao

@router.delete("/{doacao_id}")
def delete_doacao(
    doacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    doacao = db.query(Doacao).filter(Doacao.id == doacao_id).first()
    if not doacao:
        raise HTTPException(status_code=404, detail="Doacao not found")

    db.delete(doacao)
    db.commit()
    return {"message": "Doacao deleted successfully"}