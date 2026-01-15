import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { getAllSessions } from './parser';
import { startWatching, sendInitialState } from './watcher';

const app = express();
const PORT = 3001;

// CORS設定
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

// REST API: セッション一覧を取得
app.get('/api/sessions', (_req, res) => {
  try {
    const sessions = getAllSessions();
    res.json({ sessions });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HTTPサーバーを作成
const server = createServer(app);

// WebSocketサーバーを作成
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // 接続時に初期状態を送信
  sendInitialState(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ファイル監視を開始
startWatching(wss);

// サーバーを起動
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
