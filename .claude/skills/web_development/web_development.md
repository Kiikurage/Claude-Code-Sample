# Knowledge: WEB_FRONTEND

この文書には「Web、特にフロントエンド(ウェブブラウザ上で動く、UIやクライアントロジックに特化したアプリケーション)の開発に必要な知識」がまとめられています。
作業中に学んだ関連する内容は、自発的にここに追記しなさい。
この文書はできるだけ短く簡潔に維持しなさい。

---

## コメント

- 関数・メソッド・クラス・インターフェースなどには必ずJSDocスタイルのコメントを付けなさい。

    ```typescript
    /**
     * ユーザー名を取得する
     * @param user ユーザーオブジェクト
     */
    function getUserName(user: User): string {
    ```

- それ以外のインラインコメントは書いてはいけません。実際のコードを見れば理解できる挙動や、処理のグルーピング目的でのコメントは避けなさい。

    - NG

        ```typescript
        function getUserName(user: User): string {
            // ユーザー名が未設定の場合は(anonymous)を返す
            return user.name ?? '(anonymous)';
        }
        ```

        ```typescript
        function deleteUser(user: User): boolean {
            // DBからデータを削除する
            database.users.delete(user.id);
            database.favorites.deleteByUserId(user.id);
      
            // キャッシュをクリアする
            cache.users.delete(user.id);
            cache.favorites.deleteByUserId(user.id);

            return true;
        }
        ```

## URLデザイン

- REST APIのURLは `/api/{{バージョン}}/{{リソース}}` の形にしなさい。 `/api/v1/users` などです。

## 推奨ライブラリ

- `react`: WebフロントエンドUIライブラリ
- `react-icons`: アイコン
- `@tanstack/react-router`: ルーティング
    - **Code-Based Routingを使用すること**。File-Based Routingは使用しない。
    - ルート定義は各ページコンポーネントファイル内で`createRoute`を使って記述する。
        - 例: `IndexPage.tsx`に`indexRoute`を定義
            - `createRoute`でルートを定義し、`component`プロパティにページコンポーネントをインライン定義
        - 例外的に、`AppShell.tsx` (アプリケーション全体のレイアウト) には`rootRoute`を定義する
    - アプリケーションのルートReactコンポーネントが宣言されたファイル(例: `App.tsx`)でルーターインスタンスを作成する。
        - ルーターを `createRouter` で作成する。その際にルートツリーを`rootRoute.addChildren([...])`でインラインに構築する。
    - TanStack Routerの型拡張は `d.ts`ファイルに定義する
        - 例: `types/tanstack-react-router.d.ts`:
- `@tanstack/react-query`: Reactコンポーネント中での非同期のデータ読み込みに
- `express`: Webサーバ
- `bun:test`: テストフレームワーク
- `zod`: バリデーションとスキーマ定義
- `testing-library/react`: Reactコンポーネントのテスト
- `testing-library/react-hooks`: Reactフックのテスト
- `@testing-library/jest-dom`: DOMアサーションの拡張

## 型定義

- データクラスごとに専用のファイルを作成しなさい。例えば`Ticket`型は`Ticket.ts`というファイルに定義します。
- `types.ts`のような汎用的な型定義ファイルは作成しないでください。

## バリデーション

- オブジェクトの型確認には`zod`を使用しなさい。
- APIリクエストのバリデーションなど、実行時の型チェックが必要な場面では必ずzodスキーマを定義して使用しなさい。

## イディオム・設計パターン

### React

- React名前空間の値や型は、名前空間をつけずに直接importしなさい。
  
    - [BAD]

        ```tsx
        import React from "react";
      
        function App({ children }: { children: React.ReactNode }) {
            return <React.StrictMode>{children}</React.StrictMode>;
        }
        ```

    - [GOOD]

        ```tsx
        import { type ReactNode, StrictMode } from "react";
        
        function App({ children }: { children: ReactNode }) {
            return <StrictMode>{children}</StrictMode>;
        }
        ```

- イベント型（`FormEvent`など）はネイティブのものと衝突するため、代わりにイベントハンドラー型（`FormEventHandler`など）をReactからimportして使用しなさい。

    ```typescript
    import type { FormEventHandler } from "react";
    import { useState } from "react";

    function MyComponent() {
        const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
            e.preventDefault();
            // ...
        };

        return <form onSubmit={handleSubmit}>...</form>;
    }
    ```

### 共通

- モデルは基本的に共通の型定義や実装を全てのレイヤで使いなさい。DBでのDataAccessObjectやREST APIでのPresentationModelなどは合理的理由で避けられない場合を除いて導入しないでください。
    - レイヤ独自のモデルを導入する際は、もとの型名に`DB`や`API`などのprefixをつけなさい。また、変換用のメソッドはレイヤ独自型と同名のnamespaceを定義して、型の静的メソッドのように使える形で定義しなさい。

        ```typescript
        // 共通の型定義
        interface User {
            id: number;
            name: string;
        }
      
        // DBレイヤ独自の型定義
        interface DBUser {
            _id: mongo.ObjectId;
            id: number;
            name: string;
        }
        namespace DBUser {
            export function fromUser(user: User): DBUser {
                return {
                    _id: new mongo.ObjectId(),
                    id: user.id,
                    name: user.name,
                };
            }
      
            export function toUser(dbUser: DBUser): User {
                return {
                    id: dbUser.id,
                    name: dbUser.name,
                };
            }
        }
        ```
- nullishかもしれない値を扱うときは例えば以下のようにしなさい

    - 配列の中身がnullishではないことがロジック上保証できるときは、型アサーションを使いなさい

        ```typescript
        // util.ts
        export function isNotNullish<T>(x: T | undefined | null): x is T {
            return x !== undefined && x !== null
        }
      
        // usage
        const notNullishItems = nullishItems.filter(isNotNullish);
        ```

    - 変数の中身がnullishではないことがロジック上保証できるときは、assertsを使いなさい

        ```typescript
        // util.ts
        export function assertsNotNullish<T>(x: T | undefined | null): asserts x is T {
            return isNotNullish(x);
        }
      
        // usage
        type User = { name?: string };
      
        function getUserName(user: User): string {
            assertsNotNullish(user);
      
            // ここではuserがnullではないことが保証されている
            return user.name;
        }
        ```

    - TypeScriptネイティブな`enum`文は使用せず、以下のように独自に列挙値を定義しなさい。

        ```typescript
        export const Status = {
            OPEN: 'open',
            IN_PROGRESS: 'in_progress',
            CLOSED: 'closed',
        } as const;
        export type Status = (typeof Status)[keyof typeof Status];
        ```

- Reactで関数コンポーネントを作るときは、Propsは別途型定義するのではなく、関数宣言に直接書きなさい。また、propsの分割代入は関数パラメータで行いなさい。

    ```tsx
    function MyComponent({ name, label }: { name: string, label: string }) {
        return <div>{label}: {name}</div>;
    }
    ```

- React Contextでアプリ全体に値を共有する場合は、以下のパターンに従いなさい。

    ```typescript
    import { createContext, useContext } from "react";
    import type { MyService } from "./MyService";

    const context = createContext<MyService>(null as never);

    /**
     * 値を共有するためのプロバイダ
     */
    export function MyServiceProvider({
        service, children
    }: {
        service: MyService;
        children: ReactNode;
    }) {
        return (
            <context.Provider value={service}>
                {children}
            </context.Provider>
        );
    }

    /**
     * 値を取得するためのカスタムフック
     */
    export function useMyService(): MyService {
        return useContext(context);
    }
    ```

    - コンテキストの変数名は`context`とする
    - 初期値は`null as never`とし、Provider無しでの利用は想定しない
    - Providerコンポーネントとカスタムフックを同じファイルにエクスポートする
    - ファイル名は`{値の名前}Provider.tsx`とする（例: `MyServiceProvider.tsx`）
- ユーザーインタラクションに対して`onMouseOver`でリアクションする場合は、`onFocus`でも同様のリアクションをしなさい。これはアクセシビリティのためです。

    ```tsx
    <div
        onMouseOver={handleMouseOver}
        onFocus={handleMouseOver} // アクセシビリティ対応
        tabIndex={0} // フォーカス可能にする
    >
        ...
    </div>
    ```

- ユーザーインタラクションに対して`onMouseOut`でリアクションする場合は、`onBlur`でも同様のリアクションをしなさい。これはアクセシビリティのためです。

    ```tsx
    <div
        onMouseOut={handleMouseOut}
        onBlur={handleMouseOut} // アクセシビリティ対応
        tabIndex={0} // フォーカス可能にする
    >
        ...
    </div>
    ```
  
- Reactコンポーネントのテストで関数・データをモックする際に、モック対象にその後アクセスする必要がない場合は、モックを変数に束縛せずにインラインで定義しなさい。

    - [BAD] mockした関数を変数に束縛している

        ```tsx
        const onUpdate = mock(() => {});
        const onDelete = mock(() => {});
    
        render(
            <NoteItem note={mockNote} onUpdate={onUpdate} onDelete={onDelete} />,
        );
        ```

    - [GOOD] mockを束縛していない

        ```tsx
        render(
            <NoteItem note={mockNote} onUpdate={() => {}} onDelete={() => {}} />,
        );
        ```

- Reactコンポーネントのpropsの関数をモックするときは適切に型を付けなさい

    - [GOOD] onUpdateに適切に型が付いている
    
        ```tsx
        const onUpdate = mock<ComponentProps<typeof MyComponent>["onUpdate"]>(
            () => {},
        );
        ```