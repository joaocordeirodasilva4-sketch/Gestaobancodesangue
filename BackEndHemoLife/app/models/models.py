from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class TipoSanguineo(str, enum.Enum):
    A_POSITIVO = "A+"
    A_NEGATIVO = "A-"
    B_POSITIVO = "B+"
    B_NEGATIVO = "B-"
    AB_POSITIVO = "AB+"
    AB_NEGATIVO = "AB-"
    O_POSITIVO = "O+"
    O_NEGATIVO = "O-"

class StatusDoador(str, enum.Enum):
    ATIVO = "ativo"
    INATIVO = "inativo"
    INAPTO_TEMPORARIO = "inapto_temporario"

class StatusDoacao(str, enum.Enum):
    COLETADA = "coletada"
    EM_ANALISE = "em_analise"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"
    UTILIZADA = "utilizada"

class StatusSolicitacao(str, enum.Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    REJEITADA = "rejeitada"
    ENTREGUE = "entregue"

class StatusEstoque(str, enum.Enum):
    NORMAL = "normal"
    BAIXO = "baixo"
    CRITICO = "critico"

class Urgencia(str, enum.Enum):
    NORMAL = "normal"
    URGENTE = "urgente"
    EMERGENCIA = "emergencia"

class Genero(str, enum.Enum):
    MASCULINO = "masculino"
    FEMININO = "feminino"
    OUTRO = "outro"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class Doador(Base):
    __tablename__ = "doadores"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String, nullable=False)
    cpf = Column(String, unique=True)
    tipo_sanguineo = Column(Enum(TipoSanguineo), nullable=False)
    telefone = Column(String, nullable=False)
    email = Column(String)
    data_nascimento = Column(DateTime)
    genero = Column(Enum(Genero), nullable=False)
    endereco = Column(Text)
    status = Column(Enum(StatusDoador), default=StatusDoador.ATIVO)
    observacoes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Doacao(Base):
    __tablename__ = "doacoes"

    id = Column(Integer, primary_key=True, index=True)
    doador_id = Column(Integer, ForeignKey("doadores.id"))
    data_doacao = Column(DateTime, default=datetime.utcnow)
    quantidade_ml = Column(Float, nullable=False)
    status = Column(Enum(StatusDoacao), default=StatusDoacao.COLETADA)
    observacoes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    doador = relationship("Doador")

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String, nullable=False)
    cpf = Column(String, unique=True)
    tipo_sanguineo = Column(Enum(TipoSanguineo), nullable=False)
    telefone = Column(String)
    email = Column(String)
    data_nascimento = Column(DateTime)
    genero = Column(Enum(Genero))
    endereco = Column(Text)
    prioridade = Column(Enum(Urgencia), default=Urgencia.NORMAL)
    observacoes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Solicitacao(Base):
    __tablename__ = "solicitacoes"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    tipo_sanguineo = Column(Enum(TipoSanguineo), nullable=False)
    quantidade_ml = Column(Float, nullable=False)
    urgencia = Column(Enum(Urgencia), default=Urgencia.NORMAL)
    status = Column(Enum(StatusSolicitacao), default=StatusSolicitacao.PENDENTE)
    observacoes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    paciente = relationship("Paciente")

class Estoque(Base):
    __tablename__ = "estoque"

    id = Column(Integer, primary_key=True, index=True)
    tipo_sanguineo = Column(Enum(TipoSanguineo), nullable=False, unique=True)
    quantidade_ml = Column(Float, default=0)
    status = Column(Enum(StatusEstoque), default=StatusEstoque.NORMAL)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)