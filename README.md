# Note Application

## 概要

このリポジトリは、Claude Codeを用いたソフトウェア開発プロセスの実験用サンプルとして、オンラインメモ帳ウェブアプリケーションを実装しています。

シンプルで直感的なメモ管理機能を提供し、ブラウザのlocalStorageを使用してデータを永続化します。

## 特徴

- メモの作成、編集、削除
- リアルタイムでの自動保存
- ブラウザのlocalStorageによるデータ永続化
- レスポンシブなUI
- TypeScriptによる型安全な実装
- テスト環境の構築

## 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール
- **Bun** - JavaScriptランタイム & パッケージマネージャー

### テスト
- **Bun Test** - テストランナー
- **React Testing Library** - Reactコンポーネントテスト
- **Happy DOM** - DOM環境シミュレーション

### コード品質
- **Biome** - リンター & フォーマッター
- **Zod** - スキーマバリデーション

## プロジェクト構造

```
note/
├── packages/
│   ├── web/              # フロントエンドアプリケーション
│   │   ├── src/
│   │   │   ├── components/   # Reactコンポーネント
│   │   │   ├── App.tsx        # メインアプリケーション
│   │   │   └── index.tsx      # エントリーポイント
│   │   └── package.json
│   └── common/           # 共通の型定義とユーティリティ
│       ├── src/
│       │   └── note.ts        # Note型とバリデーション
│       └── package.json
├── .claude/              # Claude Code設定とスキル
└── package.json          # ワークスペース設定
```

## セットアップ

### 前提条件

- [Bun](https://bun.sh/) 1.0以上

### インストール

```bash
# 依存関係のインストール
bun install
```

## 開発

### 開発サーバーの起動

```bash
# 全パッケージの開発サーバーを起動
bun run dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:5173` にアクセスしてください。

### ビルド

```bash
# 本番用ビルド
bun run build
```

### テスト

```bash
# テスト実行
bun run test
```

### コード品質チェック

```bash
# 型チェック
bun run check

# リント & フォーマット
bun run lint
```

### クリーンアップ

```bash
# ビルド成果物の削除
bun run clean
```

## 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `bun run dev` | 開発サーバーを起動 |
| `bun run build` | 本番用ビルドを作成 |
| `bun run test` | テストを実行 |
| `bun run check` | 型チェックを実行 |
| `bun run lint` | コードのリントとフォーマット |
| `bun run clean` | ビルド成果物を削除 |

## アーキテクチャ

### データモデル

メモ（Note）は以下の構造を持ちます：

```typescript
interface Note {
  id: string;        // UUID
  title: string;     // メモのタイトル
  content: string;   // メモの内容
  createdAt: Date;   // 作成日時
}
```

### データ永続化

- ブラウザの`localStorage`を使用してメモを保存
- メモの追加・更新・削除時に自動的に保存
- アプリケーション起動時に保存されたメモを読み込み

## Claude Code開発プロセス

このプロジェクトは、Claude Codeを活用した開発プロセスの実験として作成されています。以下の開発アプローチを採用しています：

- `.claude/` ディレクトリに開発用のスキルとコマンドを配置
- 計画的な開発プロセス（`/plan` および `/impl` コマンド）
- 自動化されたコード品質チェック

## ライセンス

このプロジェクトは実験用サンプルです。

## 今後の予定

現在の開発状況：
- Reactコンポーネントのテストカバレッジ向上が必要（詳細は `REQUIREMENTS.md` を参照）
