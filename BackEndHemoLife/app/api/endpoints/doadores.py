from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Doador
from app.schemas.schemas import Doador as DoadorSchema, DoadorCreate, DoadorUpdate, PaginatedResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[DoadorSchema])
def get_doadores(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get total count
    total = db.query(func.count(Doador.id)).scalar()

    # Get paginated results with donation count
    doadores = db.query(
        Doador,
        func.count(Doacao.id).label('total_doacoes')
    ).outerjoin(Doacao).group_by(Doador.id).offset(skip).limit(limit).all()

    # Convert to response format
    data = []
    for doador, total_doacoes in doadores:
        doador_dict = {
            **doador.__dict__,
            'total_doacoes': total_doacoes
        }
        # Remove SQLAlchemy internal fields
        doador_dict.pop('_sa_instance_state', None)
        data.append(doador_dict)

    pages = (total + limit - 1) // limit  # Ceiling division

    return {
        "data": data,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "pages": pages
    }

@router.post("/", response_model=DoadorSchema)
def create_doador(
    doador: DoadorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if CPF already exists
    if doador.cpf and db.query(Doador).filter(Doador.cpf == doador.cpf).first():
        raise HTTPException(status_code=400, detail="CPF already registered")

    db_doador = Doador(**doador.model_dump())
    db.add(db_doador)
    db.commit()
    db.refresh(db_doador)
    return db_doador

@router.get("/{doador_id}", response_model=DoadorSchema)
def get_doador(
    doador_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    doador = db.query(Doador).filter(Doador.id == doador_id).first()
    if not doador:
        raise HTTPException(status_code=404, detail="Doador not found")

    # Get donation count
    total_doacoes = db.query(func.count(Doacao.id)).filter(Doacao.doador_id == doador_id).scalar()

    doador_dict = doador.__dict__.copy()
    doador_dict['total_doacoes'] = total_doacoes
    doador_dict.pop('_sa_instance_state', None)

    return doador_dict

@router.put("/{doador_id}", response_model=DoadorSchema)
def update_doador(
    doador_id: int,
    doador_update: DoadorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    doador = db.query(Doador).filter(Doador.id == doador_id).first()
    if not doador:
        raise HTTPException(status_code=404, detail="Doador not found")

    # Check if CPF is being updated and already exists
    if doador_update.cpf and doador_update.cpf != doador.cpf:
        if db.query(Doador).filter(Doador.cpf == doador_update.cpf).first():
            raise HTTPException(status_code=400, detail="CPF already registered")

    update_data = doador_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doador, field, value)

    db.commit()
    db.refresh(doador)
    return doador

@router.delete("/{doador_id}")
def delete_doador(
    doador_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    doador = db.query(Doador).filter(Doador.id == doador_id).first()
    if not doador:
        raise HTTPException(status_code=404, detail="Doador not found")

    db.delete(doador)
    db.commit()
    return {"message": "Doador deleted successfully"}