#!/usr/bin/env python3
"""GitHub Projectから特定Statusのチケットを取得するコマンド"""

import argparse
import json
import sys

from github import fetch_tickets, get_git_remote_info


def main() -> None:
    default_owner, default_repo = get_git_remote_info()

    parser = argparse.ArgumentParser(
        description="GitHub Projectから特定Statusのチケットを取得"
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
        "-s",
        "--status",
        help="フィルタリング対象のStatus (e.g., 'Todo', 'In Progress', 'Done')",
    )

    args = parser.parse_args()

    if not args.owner or not args.repo:
        parser.error(
            "リポジトリのオーナーとリポジトリ名を特定できません。"
            "git remote originを確認するか、-o/--owner と -r/--repo を明示的に指定してください。"
        )

    try:
        tickets = fetch_tickets(args.owner, args.repo, args.project, args.status)
        output = json.dumps(tickets, indent=2, ensure_ascii=False)
        print(output)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
