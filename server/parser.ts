import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProjectInfo, Todo, Session, SessionStatus } from '../src/types';

/**
 * ~/.claude.jsonをパースしてプロジェクト情報を取得
 */
export function parseClaudeJson(): Record<string, ProjectInfo> {
  const claudeJsonPath = path.normalize(path.join(os.homedir(), '.claude.json'));

  try {
    if (!fs.existsSync(claudeJsonPath)) {
      console.log('~/.claude.json not found');
      return {};
    }

    const content = fs.readFileSync(claudeJsonPath, 'utf-8');
    const data = JSON.parse(content);

    // プロジェクト情報を正規化
    const projects: Record<string, ProjectInfo> = {};

    if (data.projects) {
      for (const [projectPath, info] of Object.entries(data.projects)) {
        const normalizedPath = path.normalize(projectPath);
        projects[normalizedPath] = info as ProjectInfo;
      }
    }

    return projects;
  } catch (error) {
    console.error('Error parsing ~/.claude.json:', error);
    return {};
  }
}

/**
 * Todoファイルをパース
 */
export function parseTodos(projectPath: string): Todo[] {
  const claudeDir = path.normalize(path.join(os.homedir(), '.claude'));
  const todosDir = path.join(claudeDir, 'todos');

  try {
    if (!fs.existsSync(todosDir)) {
      return [];
    }

    // プロジェクトパスをサニタイズしてファイル名を生成
    const sanitizedPath = projectPath
      .replace(/[:\\\/]/g, '_')
      .replace(/\s+/g, '_');

    const todoFilePath = path.join(todosDir, `${sanitizedPath}.json`);

    if (!fs.existsSync(todoFilePath)) {
      return [];
    }

    const content = fs.readFileSync(todoFilePath, 'utf-8');
    const data = JSON.parse(content);

    if (Array.isArray(data.todos)) {
      return data.todos as Todo[];
    }

    return [];
  } catch (error) {
    console.error(`Error parsing todos for ${projectPath}:`, error);
    return [];
  }
}

/**
 * プロジェクトディレクトリ内のJSONLファイルから最終更新時刻を取得
 */
export function getLastUpdatedFromJsonl(projectPath: string, sessionId: string): number {
  const claudeDir = path.normalize(path.join(os.homedir(), '.claude'));
  const projectsDir = path.join(claudeDir, 'projects');

  try {
    // プロジェクトパスをサニタイズ
    const sanitizedPath = projectPath
      .replace(/[:\\\/]/g, '_')
      .replace(/\s+/g, '_');

    const sessionDir = path.join(projectsDir, sanitizedPath);

    if (!fs.existsSync(sessionDir)) {
      return Date.now();
    }

    const jsonlFile = path.join(sessionDir, `${sessionId}.jsonl`);

    if (!fs.existsSync(jsonlFile)) {
      return Date.now();
    }

    const stats = fs.statSync(jsonlFile);
    return stats.mtimeMs;
  } catch (error) {
    console.error(`Error getting last updated for ${projectPath}:`, error);
    return Date.now();
  }
}

/**
 * セッションステータスを判定
 * 30秒以内に更新があればrunning、それ以外はidle
 */
export function determineSessionStatus(
  lastUpdated: number,
  todos: Todo[]
): SessionStatus {
  const now = Date.now();
  const timeSinceUpdate = now - lastUpdated;
  const thirtySeconds = 30 * 1000;

  // 進行中のTodoがあるかチェック
  const hasInProgressTodo = todos.some(todo => todo.status === 'in_progress');

  // すべてのTodoが完了しているかチェック
  const allCompleted = todos.length > 0 && todos.every(todo => todo.status === 'completed');

  // 30秒以内の更新でin_progressのTodoがある場合はrunning
  if (timeSinceUpdate < thirtySeconds && hasInProgressTodo) {
    return 'running';
  }

  // すべて完了している場合はcompleted
  if (allCompleted) {
    return 'completed';
  }

  // Todoがあるが進行中でない場合はwaiting
  if (todos.length > 0 && !hasInProgressTodo && !allCompleted) {
    return 'waiting';
  }

  // それ以外はidle
  return 'idle';
}

/**
 * プロジェクト情報からセッション情報を構築
 */
export function buildSession(
  projectPath: string,
  projectInfo: ProjectInfo
): Session {
  const projectName = path.basename(projectPath);
  const todos = parseTodos(projectPath);
  const lastUpdated = getLastUpdatedFromJsonl(projectPath, projectInfo.lastSessionId);
  const status = determineSessionStatus(lastUpdated, todos);

  return {
    projectPath: path.normalize(projectPath),
    projectName,
    sessionId: projectInfo.lastSessionId,
    status,
    lastUpdated,
    cost: projectInfo.lastCost || 0,
    inputTokens: projectInfo.lastTotalInputTokens || 0,
    outputTokens: projectInfo.lastTotalOutputTokens || 0,
    todos,
    modelUsage: projectInfo.lastModelUsage || {},
  };
}

/**
 * すべてのセッション情報を取得
 */
export function getAllSessions(): Session[] {
  const projects = parseClaudeJson();
  const sessions: Session[] = [];

  for (const [projectPath, projectInfo] of Object.entries(projects)) {
    try {
      const session = buildSession(projectPath, projectInfo);
      sessions.push(session);
    } catch (error) {
      console.error(`Error building session for ${projectPath}:`, error);
    }
  }

  return sessions;
}
