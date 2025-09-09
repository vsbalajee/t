export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
}

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  primary?: boolean;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
}