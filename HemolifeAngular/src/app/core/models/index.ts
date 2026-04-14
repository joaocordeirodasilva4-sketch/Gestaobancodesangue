export type TipoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type StatusDoador = 'ativo' | 'inativo' | 'inapto_temporario';
export type StatusDoacao = 'coletada' | 'em_analise' | 'aprovada' | 'rejeitada' | 'utilizada';
export type StatusSolicitacao = 'pendente' | 'aprovada' | 'rejeitada' | 'entregue';
export type StatusEstoque = 'normal' | 'baixo' | 'critico';
export type Urgencia = 'normal' | 'urgente' | 'emergencia';
export type Genero = 'masculino' | 'feminino' | 'outro';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  detail: {
    code: string;
    message: string;
    field?: string;
  };
}

// ── Doador ──────────────────────────────────────────────
export interface Doador {
  id: number;
  nome_completo: string;
  cpf?: string;
  tipo_sanguineo: TipoSanguineo;
  telefone: string;
  email?: string;
  data_nascimento?: string;
  genero: Genero;
  endereco?: string;
  status: StatusDoador;
  observacoes?: string;
  total_doacoes?: number;
  created_at: string;
  updated_at?: string;
}

export interface DoadorCreate {
  nome_completo: string;
  cpf?: string;
  tipo_sanguineo: TipoSanguineo;
  telefone: string;
  email?: string;
  data_nascimento?: string;
  genero: Genero;
  endereco?: string;
  status?: StatusDoador;
  observacoes?: string;
}

export type DoadorUpdate = Partial<DoadorCreate>;

// ── Estoque ──────────────────────────────────────────────
export interface Estoque {
  tipo_sanguineo: TipoSanguineo;
  unidades_disponiveis: number;
  estoque_minimo: number;
  status: StatusEstoque;
  percentual: number;
  updated_at: string;
}

export interface EstoqueResumo {
  total_unidades: number;
  tipos: Estoque[];
}

export interface EstoqueUpdate {
  unidades_disponiveis: number;
  estoque_minimo: number;
}

export interface PedidoUrgente {
  tipo_sanguineo: TipoSanguineo;
  unidades_necessarias: number;
  unidade_hospital?: string;
  responsavel?: string;
  observacoes?: string;
}

// ── Doação ──────────────────────────────────────────────
export interface Doacao {
  id: number;
  doador_id: number;
  doador_nome?: string;
  tipo_sanguineo: TipoSanguineo;
  data_doacao: string;
  volume_ml: number;
  status: StatusDoacao;
  observacoes?: string;
  created_at: string;
}

export interface DoacaoCreate {
  doador_id: number;
  tipo_sanguineo?: TipoSanguineo;
  data_doacao: string;
  volume_ml?: number;
  status?: StatusDoacao;
  observacoes?: string;
}

export type DoacaoUpdate = Partial<DoacaoCreate>;

// ── Solicitação ──────────────────────────────────────────
export interface Solicitacao {
  id: number;
  nome_paciente: string;
  hospital: string;
  tipo_sanguineo: TipoSanguineo;
  unidades: number;
  urgencia: Urgencia;
  status: StatusSolicitacao;
  data_solicitacao: string;
  medico_responsavel?: string;
  observacoes?: string;
  created_at: string;
}

export interface SolicitacaoCreate {
  nome_paciente: string;
  hospital: string;
  tipo_sanguineo: TipoSanguineo;
  unidades: number;
  urgencia: Urgencia;
  data_solicitacao?: string;
  medico_responsavel?: string;
  observacoes?: string;
}

export type SolicitacaoUpdate = Partial<SolicitacaoCreate>;

// ── Paciente ──────────────────────────────────────────────
export interface Paciente {
  id: number;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  genero: Genero;
  tipo_sanguineo: TipoSanguineo;
  telefone?: string;
  email?: string;
  endereco?: string;
  hospital_unidade?: string;
  medico_responsavel?: string;
  diagnostico?: string;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  created_at: string;
}

export interface PacienteCreate {
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  genero: Genero;
  tipo_sanguineo: TipoSanguineo;
  telefone?: string;
  email?: string;
  endereco?: string;
  hospital_unidade?: string;
  medico_responsavel?: string;
  diagnostico?: string;
  status?: 'ativo' | 'inativo';
  observacoes?: string;
}

export type PacienteUpdate = Partial<PacienteCreate>;

// ── Dashboard ──────────────────────────────────────────────
export interface DashboardResumo {
  doadores_ativos: number;
  total_doadores: number;
  unidades_estoque: number;
  solicitacoes_pendentes: number;
  total_solicitacoes: number;
  doacoes_registradas: number;
  alertas_criticos: number;
  tipos_criticos: TipoSanguineo[];
}

// ── Auth ──────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
}
