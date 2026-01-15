// プロジェクト情報（~/.claude.jsonから）
export interface ProjectInfo {
  path: string;
  lastSessionId: string;
  lastCost: number;
  lastAPIDuration: number;
  lastToolDuration: number;
  lastDuration: number;
  lastLinesAdded: number;
  lastLinesRemoved: number;
  lastTotalInputTokens: number;
  lastTotalOutputTokens: number;
  lastTotalCacheCreationInputTokens: number;
  lastTotalCacheReadInputTokens: number;
  lastModelUsage: Record<string, ModelUsage>;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  costUSD: number;
}

// Todo情報
export interface Todo {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm: string;
}

// セッション状態
export type SessionStatus = 'running' | 'waiting' | 'completed' | 'idle';

export interface Session {
  projectPath: string;
  projectName: string;
  sessionId: string;
  status: SessionStatus;
  lastUpdated: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  todos: Todo[];
  modelUsage: Record<string, ModelUsage>;
}

// WebSocketイベント
export type WebSocketEvent =
  | { type: 'initial_state'; data: { sessions: Session[] } }
  | { type: 'session_updated'; data: Session }
  | { type: 'session_removed'; data: { projectPath: string } };
