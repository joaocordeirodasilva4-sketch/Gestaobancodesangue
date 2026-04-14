from fastapi import APIRouter

from app.api.endpoints import auth, dashboard, doadores, doacoes, pacientes, solicitacoes, estoque

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(doadores.router, prefix="/doadores", tags=["doadores"])
api_router.include_router(doacoes.router, prefix="/doacoes", tags=["doacoes"])
api_router.include_router(pacientes.router, prefix="/pacientes", tags=["pacientes"])
api_router.include_router(solicitacoes.router, prefix="/solicitacoes", tags=["solicitacoes"])
api_router.include_router(estoque.router, prefix="/estoque", tags=["estoque"])