#!/usr/bin/env python3
import argparse
import re
import sys
from pathlib import Path
from typing import List, Optional, Dict


class WorkPlanItem:
    """作業項目"""

    def __init__(self, id: int, title: str, body: str, completed: bool):
        self.id = id
        self.title = title
        self.body = body
        self.completed = completed

    def to_markdown(self) -> str:
        """マークダウン形式に変換"""
        checkbox = "[x]" if self.completed else "[ ]"
        lines = [f"- {checkbox} {self.id}: {self.title}"]
        if self.body.strip():
            lines.append("")
            # 本文を4スペースインデントで追加
            for line in self.body.strip().split("\n"):
                lines.append(f"    {line}")
        return "\n".join(lines)


class WorkPlanManager:
    """作業計画マネージャー"""

    def __init__(self, plan_file: Path):
        self.plan_file = plan_file
        self.items: List[WorkPlanItem] = []
        self.load()

    def load(self):
        """WORK_PLAN.mdから作業項目を読み込み"""
        if not self.plan_file.exists():
            self.items = []
            return

        content = self.plan_file.read_text(encoding="utf-8")
        self.items = self._parse_markdown(content)

    def _parse_markdown(self, content: str) -> List[WorkPlanItem]:
        """マークダウンから作業項目をパース"""
        items = []
        lines = content.split("\n")
        i = 0

        while i < len(lines):
            line = lines[i]
            # マッチパターン: - [ ] or - [x] の後に ID: タイトル
            match = re.match(r"^- \[([ x])\] (\d+): (.+)$", line)
            if match:
                completed = match.group(1) == "x"
                item_id = int(match.group(2))
                title = match.group(3)

                # 次の行から本文を読み込み
                body_lines = []
                i += 1

                # 空行をスキップ
                while i < len(lines) and lines[i].strip() == "":
                    i += 1

                # インデントされた行を本文として読み込み
                while i < len(lines):
                    if lines[i].startswith("    "):
                        body_lines.append(lines[i][4:])  # インデントを除去
                        i += 1
                    elif lines[i].strip() == "":
                        # 本文内の空行
                        body_lines.append("")
                        i += 1
                    else:
                        # 次のアイテムまたは他のコンテンツ
                        break

                body = "\n".join(body_lines).rstrip()
                items.append(WorkPlanItem(item_id, title, body, completed))
            else:
                i += 1

        return items

    def save(self):
        """作業項目をWORK_PLAN.mdに保存"""
        lines = []
        for item in self.items:
            lines.append(item.to_markdown())
            lines.append("")  # 項目間の空行

        content = "\n".join(lines)
        self.plan_file.write_text(content, encoding="utf-8")

    def add_item(self, title: str, body: str):
        """作業項目を追加"""
        # 新しいIDを生成（最大ID + 1）
        if self.items:
            new_id = max(item.id for item in self.items) + 1
        else:
            new_id = 1

        new_item = WorkPlanItem(new_id, title, body, completed=False)
        self.items.append(new_item)
        self.save()
        print(f"Added item {new_id}: {title}")

    def get_next(self) -> Optional[WorkPlanItem]:
        """未完了の先頭項目を取得"""
        for item in self.items:
            if not item.completed:
                return item
        return None

    def mark_complete(self, item_id: int):
        """指定IDの作業項目を完了にする"""
        for item in self.items:
            if item.id == item_id:
                if item.completed:
                    print(f"Item {item_id} is already completed")
                else:
                    item.completed = True
                    self.save()
                    print(f"Marked item {item_id} as completed")
                return

        print(f"Error: Item {item_id} not found", file=sys.stderr)
        sys.exit(1)

    def list_all(self):
        """全ての作業項目を表示"""
        if not self.items:
            print("No work items")
            return

        for item in self.items:
            status = "✓" if item.completed else " "
            print(f"[{status}] {item.id}: {item.title}")
            if item.body.strip():
                # 本文の最初の行だけ表示
                first_line = item.body.strip().split("\n")[0]
                print(f"    {first_line}")


def main():
    parser = argparse.ArgumentParser(description="Work plan manager")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Add command
    add_parser = subparsers.add_parser("add", help="Add a new work item")
    add_parser.add_argument("title", help="Title of the work item")
    add_parser.add_argument("body", nargs="?", default="", help="Body of the work item")

    # Next command
    subparsers.add_parser("next", help="Get the next pending work item")

    # Complete command
    complete_parser = subparsers.add_parser("complete", help="Mark an item as completed")
    complete_parser.add_argument("id", type=int, help="ID of the item to complete")

    # List command
    subparsers.add_parser("list", help="List all work items")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)

    # Initialize manager with WORK_PLAN.md in current working directory
    cwd = Path.cwd()
    plan_file = cwd / "WORK_PLAN.md"
    manager = WorkPlanManager(plan_file)

    # Execute command
    if args.command == "add":
        manager.add_item(args.title, args.body)

    elif args.command == "next":
        next_item = manager.get_next()
        if next_item:
            print(f"ID: {next_item.id}")
            print(f"Title: {next_item.title}")
            if next_item.body.strip():
                print(f"\n{next_item.body}")
        else:
            print("All work items are completed!")

    elif args.command == "complete":
        manager.mark_complete(args.id)

    elif args.command == "list":
        manager.list_all()


if __name__ == "__main__":
    main()