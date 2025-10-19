#!/usr/bin/env python3
"""GitHub ProjectのIssueのStatusを更新するコマンド"""

import argparse
import sys

from github import get_git_remote_info, update_ticket_status


def main() -> None:
    default_owner, default_repo = get_git_remote_info()

    parser = argparse.ArgumentParser(
        description="GitHub ProjectのIssueのStatusを更新"
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
        "-i",
        "--issue",
        type=int,
        required=True,
        help="Issue番号 (e.g., 10)",
    )
    parser.add_argument(
        "-s",
        "--status",
        required=True,
        help="新しいStatus (e.g., 'Todo', 'In Progress', 'Done')",
    )

    args = parser.parse_args()

    if not args.owner or not args.repo:
        parser.error(
            "リポジトリのオーナーとリポジトリ名を特定できません。"
            "git remote originを確認するか、-o/--owner と -r/--repo を明示的に指定してください。"
        )

    try:
        update_ticket_status(args.owner, args.repo, args.project, args.issue, args.status)
        print(f"Issue #{args.issue} のStatusを '{args.status}' に更新しました")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
