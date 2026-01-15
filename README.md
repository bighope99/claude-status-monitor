# Claude Code Status Monitor

Claude Codeのローカルセッションをリアルタイム監視するダッシュボードアプリケーション

## 概要

Claude Codeで実行中のセッションの状態、トークン使用量、コスト、Todoリストの進捗などを視覚的に監視できるWebアプリケーションです。WebSocketによるリアルタイム更新に対応しています。

## 主な機能

- **セッション一覧表示**
  - Running: 実行中のセッション
  - Waiting: 待機中のセッション
  - Completed: 完了したセッション
  - Idle: アイドル状態のセッション

- **トークン使用量・コスト表示**
  - セッションごとの詳細なトークン消費量
  - リアルタイムでのコスト計算

- **Todoリストの進捗表示**
  - pending/in_progress/completedの状態別表示
  - セッションに紐づくタスクの一覧

- **リアルタイム更新**
  - WebSocketによる自動更新
  - ファイルシステムの変更を即座に反映

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts（グラフ表示）

### バックエンド
- Node.js
- Express 5
- WebSocket (ws)
- chokidar（ファイル監視）

## セットアップ

### 1. 依存関係のインストール

```bash
cd claude-status-monitor
npm install
```

## 起動方法

### 通常起動（フロントエンド + バックエンド同時起動）

```bash
npm run dev
```

起動後、以下のURLでアクセス可能です：
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3001

### 個別起動

フロントエンドのみ起動：
```bash
npm run dev:client
```

バックエンドのみ起動：
```bash
npm run dev:server
```

## データソース

本アプリケーションは、Claude Codeが生成する以下のファイルを監視します：

- `~/.claude.json` - プロジェクトとセッションの情報
- `~/.claude/todos/` - Todoリストデータ
- `~/.claude/projects/` - セッションログとトークン使用量

## ステータス判定ロジック

セッションのステータスは以下のルールで自動判定されます：

| ステータス | 条件 |
|-----------|------|
| **Running** | 30秒以内にファイルが更新された |
| **Waiting** | Todoリストにpendingまたはin_progressのタスクがある |
| **Completed** | セッションが終了している（end_timeが記録されている） |
| **Idle** | 上記のいずれにも該当せず、更新がない状態 |

## ビルド

本番用のビルドを作成する場合：

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

## プレビュー

ビルド後のプレビューを確認：

```bash
npm run preview
```

## ライセンス

Private

## 開発

このプロジェクトは以下のコマンドでコード品質をチェックできます：

```bash
npm run lint
```
