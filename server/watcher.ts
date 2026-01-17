import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import os from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import { getAllSessions } from './parser';
import { WebSocketEvent } from '../src/types';

let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 100; // 100ms

/**
 * ファイル監視を開始し、WebSocketでブロードキャスト
 */
export function startWatching(wss: WebSocketServer): FSWatcher {
  const claudeDir = path.normalize(path.join(os.homedir(), '.claude'));
  const claudeJsonPath = path.normalize(path.join(os.homedir(), '.claude.json'));
  const todosDir = path.join(claudeDir, 'todos');
  const projectsDir = path.join(claudeDir, 'projects');

  console.log('Starting file watcher...');
  console.log('Watching:', {
    claudeJson: claudeJsonPath,
    todosDir,
    projectsDir,
  });

  // 監視するパス
  const watchPaths = [
    claudeJsonPath,
    path.join(todosDir, '*.json'),
    path.join(projectsDir, '**', '*.jsonl'),
  ];

  const watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  // デバウンス処理付きでブロードキャスト
  const debouncedBroadcast = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      broadcastUpdate(wss);
    }, DEBOUNCE_DELAY);
  };

  watcher.on('change', (filePath: string) => {
    console.log(`File changed: ${filePath}`);
    debouncedBroadcast();
  });

  watcher.on('add', (filePath: string) => {
    console.log(`File added: ${filePath}`);
    debouncedBroadcast();
  });

  watcher.on('unlink', (filePath: string) => {
    console.log(`File removed: ${filePath}`);
    debouncedBroadcast();
  });

  watcher.on('error', (error: Error) => {
    console.error('Watcher error:', error);
  });

  watcher.on('ready', () => {
    console.log('File watcher ready');
  });

  return watcher;
}

/**
 * WebSocketクライアントに更新をブロードキャスト
 */
export function broadcastUpdate(wss: WebSocketServer) {
  try {
    const sessions = getAllSessions();

    // すべてのクライアントにブロードキャスト
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN状態
        // すべてのセッションを送信
        const initialEvent: WebSocketEvent = {
          type: 'initial_state',
          data: { sessions },
        };
        client.send(JSON.stringify(initialEvent));
      }
    });

    console.log(`Broadcasted update to ${wss.clients.size} clients`);
  } catch (error) {
    console.error('Error broadcasting update:', error);
  }
}

/**
 * クライアント接続時に初期状態を送信
 */
export function sendInitialState(ws: WebSocket) {
  try {
    const sessions = getAllSessions();

    const event: WebSocketEvent = {
      type: 'initial_state',
      data: { sessions },
    };

    ws.send(JSON.stringify(event));
    console.log('Sent initial state to client');
  } catch (error) {
    console.error('Error sending initial state:', error);
  }
}
