/** Status possíveis no pipeline de abordagem GVP */
export type StatusMedico =
  | 'novo'
  | 'pronto'
  | 'abordando'
  | 'concluido'
  | 'agendado'
  | 'impossivel';

/** Modelo principal — um registro de médico na base GVP */
export interface Medico {
  id: number;
  nome: string;
  especialidade?: string;
  telefone?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  cns?: string;
  sus?: string;
  vinculo?: string;
  consultorio_nome?: string;
  consultorio_endereco?: string;
  consultorio_cep?: string;
  consultorio_telefone?: string;
  status_atual: StatusMedico;
  responsavel_nome?: string;
  abordado_por?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

/** Campos usados para calcular a completude da ficha */
export const CAMPOS_COMPLETUDE: (keyof Medico)[] = [
  'nome',
  'especialidade',
  'telefone',
  'email',
  'instagram',
  'linkedin',
  'consultorio_nome',
  'consultorio_endereco',
];
