from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Doador, Doacao, Paciente, Solicitacao, Estoque
from app.schemas.schemas import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get counts
    total_doadores = db.query(func.count(Doador.id)).scalar()
    total_doacoes = db.query(func.count(Doacao.id)).scalar()
    total_pacientes = db.query(func.count(Paciente.id)).scalar()
    total_solicitacoes = db.query(func.count(Solicitacao.id)).scalar()

    # Get stock by blood type
    estoque_query = db.query(Estoque).all()
    estoque_por_tipo = {estoque.tipo_sanguineo.value: estoque.quantidade_ml for estoque in estoque_query}

    return {
        "total_doadores": total_doadores,
        "total_doacoes": total_doacoes,
        "total_pacientes": total_pacientes,
        "total_solicitacoes": total_solicitacoes,
        "estoque_por_tipo": estoque_por_tipo
    }