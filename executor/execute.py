#!/usr/bin/env python3
"""チケットをClaude Codeに実行させるコマンド"""

import argparse
import hashlib
import json
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path

from github import get_git_remote_info, get_issue_details, post_issue_comment, fetch_tickets
from logger import SimpleLogger


# プロンプトテンプレート
PROMPT_TEMPLATE = """# チケット #{issue_number}: {issue_title}

## 概要
{issue_body}

## メタデータ
- **ステータス**: {issue_state}
- **作成者**: {issue_author}
- **ラベル**: {issue_labels}
- **作成日**: {issue_created_at}
- **更新日**: {issue_updated_at}

## 実行内容
このチケットに基づいて、以下のタスクを実行してください：

1. `feature/{issue_number}` ブランチに移動する。ブランチが存在しなければmasterへ移動し、最新版をpullしたあと新しくブランチを作成する。
2. 上記の説明に従って実装を進める。
3. 適切なテストを追加する。
4. 必要に応じてドキュメントを更新する。
5. 変更をコミットして、プルリクエストを作成する。

    - プルリクエストのメッセージは 「#{issue_number}:(変更の概要)」 とする。
    - 本文末尾に "Close #{issue_number}" を追加し、チケットを自動でクローズできるようにする。
    - プルリクエストの自動マージを有効化する。

6. masterブランチへ戻る。

コードの品質に注意し、プロジェクトの標準に従ってください。"""


def render_prompt(issue_details: dict) -> str:
    """チケット情報をプロンプトテンプレートに補完

    Args:
        issue_details: get_issue_detailsの返り値

    Returns:
        レンダリング済みプロンプト
    """
    labels = ", ".join(issue_details.get("labels", [])) or "なし"

    return PROMPT_TEMPLATE.format(
        issue_number=issue_details.get("number"),
        issue_title=issue_details.get("title"),
        issue_body=issue_details.get("body") or "説明なし",
        issue_state=issue_details.get("state"),
        issue_author=issue_details.get("author", "unknown"),
        issue_labels=labels,
        issue_created_at=issue_details.get("created_at", "unknown"),
        issue_updated_at=issue_details.get("updated_at", "unknown"),
    )


def create_comment_body(masked_url: str, summary: dict[str, str]) -> str:
    """コメント本文を生成（マスクURLを含む）

    Args:
        masked_url: マスクされたログファイルURL
        summary: 実行結果のサマリー

    Returns:
        コメント本文
    """
    status_emoji = "✅" if summary["status"] == "SUCCESS" else "❌"

    return f"""{status_emoji} **Claude Code 実行完了**

**実行結果:**
- Status: {summary["status"]}
- Exit Code: {summary["exit_code"]}
- Duration: {summary["duration"]}

📎 **ログファイル:** {masked_url}

詳細はログファイルを参照してください。
"""


def log_summary(logger: SimpleLogger, issue_number: int, exit_code: int, duration: float) -> None:
    """実行結果のサマリーをロガーに記録

    Args:
        logger: SimpleLogger インスタンス
        issue_number: Issue番号
        exit_code: Claude Codeの終了コード
        duration: 実行時間（秒）
    """
    status = "SUCCESS" if exit_code == 0 else "FAILED"

    logger.info("")
    logger.info("=" * 80)
    logger.info(f"Issue #{issue_number} execution: {status}")
    logger.info(f"Exit Code: {exit_code}")
    logger.info(f"Duration: {duration:.2f}s")
    logger.info("=" * 80)


def execute_with_claude(logger: SimpleLogger, prompt: str) -> int:
    """プロンプトをClaude Codeで実行

    Claude Codeをヘッドレスモードで呼び出し、stdout/stderrをリアルタイムでloggerに書き込みます。

    Args:
        logger: SimpleLogger インスタンス
        prompt: 実行するプロンプト

    Returns:
        終了コード
    """
    try:
        # Claude Codeプロセスを起動
        process = subprocess.Popen(
            [
                "claude",
                "-p", prompt,
                "--output-format", "text",
                "--verbose",
                "--allowedTools", "Read,Grep,WebSearch",
                "--permission-mode", "acceptEdits"
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

        # stdout と stderr を別スレッドで読み込む
        def read_stream(stream, is_stderr: bool = False):
            for line in iter(stream.readline, ""):
                if line:
                    if is_stderr:
                        logger.error(line.rstrip())
                    else:
                        logger.info(line.rstrip())

        stdout_thread = threading.Thread(target=read_stream, args=(process.stdout,))
        stderr_thread = threading.Thread(target=read_stream, args=(process.stderr, True))

        stdout_thread.daemon = True
        stderr_thread.daemon = True

        stdout_thread.start()
        stderr_thread.start()

        # プロンプトを入力して実行
        process.stdin.write(prompt)
        process.stdin.close()

        # プロセスが完了するまで待機（30分間のタイムアウト）
        exit_code = process.wait(timeout=1800)

        # スレッドが完了するまで待機
        stdout_thread.join(timeout=5)
        stderr_thread.join(timeout=5)

        return exit_code

    except subprocess.TimeoutExpired:
        logger.error("Claude Codeの実行がタイムアウトしました（30分以上の処理時間）")
        process.kill()
        return 1
    except FileNotFoundError:
        logger.error("Claude Codeが見つかりません。'claude' コマンドがインストールされているか確認してください。")
        return 1
    except Exception as e:
        logger.error(f"Claude Code実行中にエラーが発生しました: {e}")
        return 1


def main() -> None:
    default_owner, default_repo = get_git_remote_info()

    parser = argparse.ArgumentParser(
        description="チケットをClaude Codeに実行させる"
    )
    parser.add_argument(
        "-o",
        "--owner",
        default=default_owner,
        help="リポジトリのオーナー (デフォルト: git remote originから自動取得)",
    )
    parser.add_argument(
        "-r",
        "--repo",
        default=default_repo,
        help="リポジトリ名 (デフォルト: git remote originから自動取得)",
    )
    parser.add_argument(
        "-p",
        "--project",
        type=int,
        required=True,
        help="プロジェクト番号 (e.g., 1)",
    )
    parser.add_argument(
        "--format",
        choices=["prompt", "json"],
        default="prompt",
        help="出力形式 (デフォルト: prompt)",
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Claude Codeで実際に実行する（ログが保存されます）",
    )

    args = parser.parse_args()

    if not args.owner or not args.repo:
        parser.error(
            "リポジトリのオーナーとリポジトリ名を特定できません。"
            "git remote originを確認するか、-o/--owner と -r/--repo を明示的に指定してください。"
        )

    try:
        # Backlogから最初のチケットを取得
        tickets = fetch_tickets(args.owner, args.repo, args.project, "Backlog")

        if not tickets:
            print("Error: Backlogにチケットがありません", file=sys.stderr)
            sys.exit(1)

        # 最初のチケットを選ぶ
        first_ticket = tickets[0]
        issue_number = first_ticket.get("number")

        if not issue_number:
            print("Error: チケット番号を取得できません", file=sys.stderr)
            sys.exit(1)

        print(f"✓ Backlogから最初のチケットを取得しました: #{issue_number}")

        # チケット詳細を取得
        issue_details = get_issue_details(args.owner, args.repo, issue_number)

        if args.format == "json":
            output = json.dumps(issue_details, indent=2, ensure_ascii=False)
        else:
            output = render_prompt(issue_details)

        if args.execute:
            # ユニークなログファイル名を生成
            log_dir = Path(__file__).parent / "logs"
            hash_value = hashlib.sha256(output.encode()).hexdigest()[:8]
            log_filename = f"issue_{issue_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash_value}.log"
            log_file_path = log_dir / log_filename

            # ロガーをセットアップ
            logger = SimpleLogger(str(log_file_path), dummy_dir_seed=str(log_dir))

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(f"[{timestamp}] ✓ Claude Codeで実行開始")
            print(f"[{timestamp}] ✓ Claude Codeで実行開始")

            # Claude Codeで実行（リアルタイムでログに出力）
            start_time = time.time()
            exit_code = execute_with_claude(logger, output)
            duration = time.time() - start_time

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(f"[{timestamp}] ✓ Claude Codeで実行完了")
            print(f"[{timestamp}] ✓ Claude Codeで実行完了")

            # サマリーをログに記録
            log_summary(logger, issue_number, exit_code, duration)

            # サマリーを作成
            summary = {
                "status": "SUCCESS" if exit_code == 0 else "FAILED",
                "exit_code": str(exit_code),
                "duration": f"{duration:.2f} seconds",
            }

            # マスクURLを生成
            masked_url = logger.get_url()

            # コメント本文を生成
            comment_body = create_comment_body(masked_url, summary)

            # コメントを投稿
            post_issue_comment(args.owner, args.repo, issue_number, comment_body)
            logger.info(f"✓ コメントをIssue #{issue_number} にポストしました")
            print(f"✓ コメントをIssue #{issue_number} にポストしました")

            print(f"ログファイル: {logger.get_file_path()}")
            print(f"マスクURL: {masked_url}")
            print(f"終了コード: {exit_code}")
            if exit_code != 0:
                sys.exit(exit_code)
        else:
            print(output)

    except Exception as e:
        error_msg = f"Error: {e}"
        print(error_msg, file=sys.stderr)
        if 'logger' in locals():
            logger.error(error_msg)
        sys.exit(1)


if __name__ == "__main__":
    main()
