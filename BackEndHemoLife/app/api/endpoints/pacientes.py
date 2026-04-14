from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Paciente
from app.schemas.schemas import Paciente as PacienteSchema, PacienteCreate, PacienteUpdate, PaginatedResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[PacienteSchema])
def get_pacientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    total = db.query(func.count(Paciente.id)).scalar()
    pacientes = db.query(Paciente).offset(skip).limit(limit).all()

    pages = (total + limit - 1) // limit

    return {
        "data": pacientes,
        "total": total,
        "page": (skip // limit) + 1,
        "limit": limit,
        "pages": pages
    }

@router.post("/", response_model=PacienteSchema)
def create_paciente(
    paciente: PacienteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if paciente.cpf and db.query(Paciente).filter(Paciente.cpf == paciente.cpf).first():
        raise HTTPException(status_code=400, detail="CPF already registered")

    db_paciente = Paciente(**paciente.model_dump())
    db.add(db_paciente)
    db.commit()
    db.refresh(db_paciente)
    return db_paciente

@router.get("/{paciente_id}", response_model=PacienteSchema)
def get_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente not found")
    return paciente

@router.put("/{paciente_id}", response_model=PacienteSchema)
def update_paciente(
    paciente_id: int,
    paciente_update: PacienteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente not found")

    if paciente_update.cpf and paciente_update.cpf != paciente.cpf:
        if db.query(Paciente).filter(Paciente.cpf == paciente_update.cpf).first():
            raise HTTPException(status_code=400, detail="CPF already registered")

    update_data = paciente_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(paciente, field, value)

    db.commit()
    db.refresh(paciente)
    return paciente

@router.delete("/{paciente_id}")
def delete_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente not found")

    db.delete(paciente)
    db.commit()
    return {"message": "Paciente deleted successfully"}