#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


class FullScanManager:
    def __init__(self, progress_file: Path):
        self.progress_file = progress_file
        self.purpose: Optional[str] = None
        self.patterns: List[str] = []
        self.files: Dict[str, bool] = {}
        self.load()

    def load(self):
        """Load progress data from JSON file."""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, "r") as f:
                    content = f.read().strip()
                    if content:
                        data = json.loads(content)
                        # Support both old and new format
                        if "files" in data:
                            # New format with metadata
                            self.purpose = data.get("purpose")
                            self.patterns = data.get("patterns", [])
                            self.files = data.get("files", {})
                        else:
                            # Old format (just files)
                            self.files = data
                            self.purpose = None
                            self.patterns = []
                    else:
                        self._reset()
            except json.JSONDecodeError:
                print(
                    f"Warning: Failed to parse {self.progress_file}. Starting with empty data.",
                    file=sys.stderr,
                )
                self._reset()
        else:
            self._reset()

    def _reset(self):
        """Reset all data to empty state."""
        self.purpose = None
        self.patterns = []
        self.files = {}

    def save(self):
        """Save progress data to JSON file."""
        data = {
            "purpose": self.purpose,
            "patterns": self.patterns,
            "files": self.files,
        }
        with open(self.progress_file, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def init(self, purpose: str):
        """Initialize a new scan session with purpose."""
        self._reset()
        self.purpose = purpose
        self.save()
        print(f"Initialized new scan session: {purpose}")

    def add_pattern(self, pattern: str, cwd: Path, purpose: Optional[str] = None):
        """Add files matching the glob pattern."""
        # Set purpose if provided and not already set
        if purpose and not self.purpose:
            self.purpose = purpose

        # Add pattern to list if not already present
        if pattern not in self.patterns:
            self.patterns.append(pattern)

        matches = list(cwd.glob(pattern))
        added_count = 0

        for path in matches:
            if path.is_file():
                # Store relative path from cwd
                relative_path = str(path.relative_to(cwd))
                if relative_path not in self.files:
                    self.files[relative_path] = False
                    added_count += 1

        self.save()
        print(f"Added {added_count} new files (found {len(matches)} total matches)")

    def get_next(self, count: int = 5) -> List[str]:
        """Get next N pending files."""
        pending = [path for path, completed in self.files.items() if not completed]
        return pending[:count]

    def mark_complete(self, paths: List[str]):
        """Mark specified paths as completed."""
        completed_count = 0
        not_found = []

        for path in paths:
            if path in self.files:
                if not self.files[path]:
                    self.files[path] = True
                    completed_count += 1
            else:
                not_found.append(path)

        self.save()

        if completed_count > 0:
            print(f"Marked {completed_count} file(s) as completed")

        if not_found:
            print(
                f"Warning: {len(not_found)} path(s) not found in progress file",
                file=sys.stderr,
            )
            for path in not_found:
                print(f"  - {path}", file=sys.stderr)

    def get_stats(self) -> Dict[str, int]:
        """Get statistics about progress."""
        total = len(self.files)
        completed = sum(1 for c in self.files.values() if c)
        pending = total - completed
        return {"total": total, "completed": completed, "pending": pending}

    def get_info(self) -> Dict[str, Any]:
        """Get information about current scan session."""
        stats = self.get_stats()
        return {
            "purpose": self.purpose,
            "patterns": self.patterns,
            "stats": stats,
        }


def main():
    parser = argparse.ArgumentParser(description="Full scan progress manager")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Init command
    init_parser = subparsers.add_parser(
        "init", help="Initialize a new scan session"
    )
    init_parser.add_argument("purpose", help="Purpose of this scan session")

    # Add command
    add_parser = subparsers.add_parser("add", help="Add files matching glob pattern")
    add_parser.add_argument("pattern", help="Glob pattern to match files")
    add_parser.add_argument(
        "--purpose", "-p", help="Set purpose for this scan (if not already set)"
    )

    # Next command
    subparsers.add_parser("next", help="Get next 5 pending files")

    # Complete command
    complete_parser = subparsers.add_parser(
        "complete", help="Mark files as completed"
    )
    complete_parser.add_argument(
        "paths", nargs="+", help="Paths to mark as completed"
    )

    # Stats command
    subparsers.add_parser("stats", help="Show progress statistics")

    # Info command
    subparsers.add_parser("info", help="Show scan session information")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)

    # Initialize manager with progress file in current working directory
    cwd = Path.cwd()
    progress_file = cwd / "full_scan_progress.json"
    manager = FullScanManager(progress_file)

    # Execute command
    if args.command == "init":
        manager.init(args.purpose)

    elif args.command == "add":
        manager.add_pattern(args.pattern, cwd, purpose=args.purpose)

    elif args.command == "next":
        next_files = manager.get_next(5)
        if next_files:
            for path in next_files:
                print(path)
        else:
            print("No pending files")

    elif args.command == "complete":
        manager.mark_complete(args.paths)

    elif args.command == "stats":
        stats = manager.get_stats()
        print(f"Total: {stats['total']}")
        print(f"Completed: {stats['completed']}")
        print(f"Pending: {stats['pending']}")
        if stats["total"] > 0:
            percentage = (stats["completed"] / stats["total"]) * 100
            print(f"Progress: {percentage:.1f}%")

    elif args.command == "info":
        info = manager.get_info()
        print(f"Purpose: {info['purpose'] or 'Not set'}")
        print(f"Patterns: {', '.join(info['patterns']) or 'None'}")
        print(f"Total files: {info['stats']['total']}")
        print(f"Completed: {info['stats']['completed']}")
        print(f"Pending: {info['stats']['pending']}")
        if info["stats"]["total"] > 0:
            percentage = (info["stats"]["completed"] / info["stats"]["total"]) * 100
            print(f"Progress: {percentage:.1f}%")


if __name__ == "__main__":
    main()
