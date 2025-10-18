---
name: web_development
description: Web開発に関するスキル。TypeScript/JavaScript/React/Vue等のフロントエンドコード（HTML/CSS含む）に関する知識。
---

# Knowledge

以下のknowledgeファイルは必ずすべて読み込みなさい

- ./web_development.md

---

## 本プロジェクトにおけるWeb開発の検証方法

このプロジェクトではBunとTypeScriptを使用しています。コード変更後は以下の検証を必ず実行してください。

### 1. 型チェック

TypeScriptの型エラーがないことを確認します。

```bash
bun run check
```

- すべてのパッケージで型チェックが実行されます
- エラーが出た場合は必ず修正してください

### 2. Lint

コードスタイルとコード品質をチェックします。

```bash
bun run lint
```

- Biomeを使用してコードの整形とlintを実行します
- 自動修正可能なものは自動的に修正されます

### 3. テスト

すべてのテストが成功することを確認します。

```bash
# 全パッケージのテストを実行
bun test

# packages/webのテストのみ実行（DOM環境が必要な場合）
cd packages/web && bun test
```

**重要な注意点**:
- 新しいコンポーネントを作成したら、必ずテストファイルも作成してください
- テストファイル名は `*.test.tsx` または `*.test.ts` とします
- テストファイルのimport文には `.js` 拡張子を付けてください（例: `import { Component } from "./Component.js"`）
  - これは `moduleResolution: "node16"` の要件です

### 4. ビルド

本番用ビルドが成功することを確認します。

```bash
bun run build
```

### すべてをまとめて実行

以下のコマンドで、検証をまとめて実行できます:

```bash
bun run check && bun run lint && bun test && bun run build
```

### 新しいReactコンポーネント作成時のチェックリスト

- [ ] コンポーネントファイル（`Component.tsx`）を作成
- [ ] テストファイル（`Component.test.tsx`）を作成
- [ ] テストに以下を含める:
  - [ ] レンダリングの確認
  - [ ] プロパティの動作確認
  - [ ] イベントハンドラーの動作確認（該当する場合）
  - [ ] エッジケースのテスト
- [ ] `bun run check` が成功することを確認
- [ ] `bun test` が成功することを確認
- [ ] `bun run build` が成功することを確認
