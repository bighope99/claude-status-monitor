// Hook state management for real-time status updates

export interface HookState {
  projectPath: string;
  eventType: string;
  timestamp: number;
}

const hookStates: Map<string, HookState> = new Map();
const HOOK_STATE_TTL = 30 * 1000;

// Normalize path to use forward slashes for consistent comparison
function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function setHookState(projectPath: string, eventType: string): void {
  const normalizedPath = normalizePath(projectPath);
  hookStates.set(normalizedPath, {
    projectPath: normalizedPath,
    eventType,
    timestamp: Date.now(),
  });
}

export function getHookState(projectPath: string): HookState | undefined {
  const normalizedPath = normalizePath(projectPath);
  const state = hookStates.get(normalizedPath);
  if (!state) return undefined;
  if (Date.now() - state.timestamp > HOOK_STATE_TTL) {
    hookStates.delete(normalizedPath);
    return undefined;
  }
  return state;
}

export function clearHookState(projectPath: string): void {
  hookStates.delete(normalizePath(projectPath));
}

export function getAllHookStates(): Map<string, HookState> {
  const now = Date.now();
  for (const [key, state] of hookStates) {
    if (now - state.timestamp > HOOK_STATE_TTL) {
      hookStates.delete(key);
    }
  }
  return hookStates;
}
