from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Solicitacao
from app.schemas.schemas import Solicitacao as SolicitacaoSchema, SolicitacaoCreate, SolicitacaoUpdate, PaginatedResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[SolicitacaoSchema])
def get_solicitacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    total = db.query(func.count(Solicitacao.id)).scalar()
    solicitacoes = db.query(Solicitacao).offset(skip).limit(limit).all()

    pages = (total + limit - 1) // limit

    return {
        "data": solicitacoes,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "pages": pages
    }

@router.post("/", response_model=SolicitacaoSchema)
def create_solicitacao(
    solicitacao: SolicitacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if paciente exists
    from app.models.models import Paciente
    paciente = db.query(Paciente).filter(Paciente.id == solicitacao.paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente not found")

    db_solicitacao = Solicitacao(**solicitacao.model_dump())
    db.add(db_solicitacao)
    db.commit()
    db.refresh(db_solicitacao)
    return db_solicitacao

@router.get("/{solicitacao_id}", response_model=SolicitacaoSchema)
def get_solicitacao(
    solicitacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == solicitacao_id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitacao not found")
    return solicitacao

@router.put("/{solicitacao_id}", response_model=SolicitacaoSchema)
def update_solicitacao(
    solicitacao_id: int,
    solicitacao_update: SolicitacaoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == solicitacao_id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitacao not found")

    update_data = solicitacao_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(solicitacao, field, value)

    db.commit()
    db.refresh(solicitacao)
    return solicitacao

@router.delete("/{solicitacao_id}")
def delete_solicitacao(
    solicitacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    solicitacao = db.query(Solicitacao).filter(Solicitacao.id == solicitacao_id).first()
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitacao not found")

    db.delete(solicitacao)
    db.commit()
    return {"message": "Solicitacao deleted successfully"}