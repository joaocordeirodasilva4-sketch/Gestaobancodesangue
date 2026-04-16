from pydantic import BaseModel, EmailStr
from typing import Optional, List, Generic, TypeVar
from datetime import datetime
from app.models.models import (
    TipoSanguineo, StatusDoador, StatusDoacao, StatusSolicitacao,
    StatusEstoque, Urgencia, Genero
)

T = TypeVar('T')

# Authentication
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

class LoginResponse(Token):
    user: User

# Common
class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    total: int
    page: int
    limit: int
    pages: int

# Doador
class DoadorBase(BaseModel):
    nome_completo: str
    cpf: Optional[str] = None
    tipo_sanguineo: TipoSanguineo
    telefone: str
    email: Optional[EmailStr] = None
    data_nascimento: Optional[datetime] = None
    genero: Genero
    endereco: Optional[str] = None
    status: StatusDoador = StatusDoador.ATIVO
    observacoes: Optional[str] = None

class DoadorCreate(DoadorBase):
    pass

class DoadorUpdate(BaseModel):
    nome_completo: Optional[str] = None
    cpf: Optional[str] = None
    tipo_sanguineo: Optional[TipoSanguineo] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    data_nascimento: Optional[datetime] = None
    genero: Optional[Genero] = None
    endereco: Optional[str] = None
    status: Optional[StatusDoador] = None
    observacoes: Optional[str] = None

class Doador(DoadorBase):
    id: int
    total_doacoes: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Doacao
class DoacaoBase(BaseModel):
    doador_id: int
    quantidade_ml: float
    status: StatusDoacao = StatusDoacao.COLETADA
    observacoes: Optional[str] = None

class DoacaoCreate(DoacaoBase):
    pass

class DoacaoUpdate(BaseModel):
    status: Optional[StatusDoacao] = None
    observacoes: Optional[str] = None

class Doacao(DoacaoBase):
    id: int
    data_doacao: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Paciente
class PacienteBase(BaseModel):
    nome_completo: str
    cpf: Optional[str] = None
    tipo_sanguineo: TipoSanguineo
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    data_nascimento: Optional[datetime] = None
    genero: Optional[Genero] = None
    endereco: Optional[str] = None
    prioridade: Urgencia = Urgencia.NORMAL
    observacoes: Optional[str] = None

class PacienteCreate(PacienteBase):
    pass

class PacienteUpdate(BaseModel):
    nome_completo: Optional[str] = None
    cpf: Optional[str] = None
    tipo_sanguineo: Optional[TipoSanguineo] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    data_nascimento: Optional[datetime] = None
    genero: Optional[Genero] = None
    endereco: Optional[str] = None
    prioridade: Optional[Urgencia] = None
    observacoes: Optional[str] = None

class Paciente(PacienteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Solicitacao
class SolicitacaoBase(BaseModel):
    paciente_id: int
    tipo_sanguineo: TipoSanguineo
    quantidade_ml: float
    urgencia: Urgencia = Urgencia.NORMAL
    status: StatusSolicitacao = StatusSolicitacao.PENDENTE
    observacoes: Optional[str] = None

class SolicitacaoCreate(SolicitacaoBase):
    pass

class SolicitacaoUpdate(BaseModel):
    status: Optional[StatusSolicitacao] = None
    observacoes: Optional[str] = None

class Solicitacao(SolicitacaoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Estoque
class EstoqueBase(BaseModel):
    tipo_sanguineo: TipoSanguineo
    quantidade_ml: float = 0
    status: StatusEstoque = StatusEstoque.NORMAL

class EstoqueCreate(EstoqueBase):
    pass

class EstoqueUpdate(BaseModel):
    quantidade_ml: Optional[float] = None
    status: Optional[StatusEstoque] = None

class Estoque(EstoqueBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Dashboard
class DashboardStats(BaseModel):
    total_doadores: int
    total_doacoes: int
    total_pacientes: int
    total_solicitacoes: int
    estoque_por_tipo: dict