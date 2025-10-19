"""シンプルなログ記録モジュール"""

import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional


class SimpleLogger:
    """シンプルなファイルロガー"""

    def __init__(self, log_file_path: str, dummy_dir_seed: Optional[str] = None):
        """初期化

        Args:
            log_file_path: ログファイルのパス
            dummy_dir_seed: ダミーディレクトリ名の生成に使用するシード
        """
        self.log_file = Path(log_file_path)
        self.log_file.parent.mkdir(parents=True, exist_ok=True)

        # ダミーディレクトリ名を生成
        if dummy_dir_seed is None:
            dummy_dir_seed = str(self.log_file.parent.absolute())

        self.dummy_dir_hash = hashlib.sha256(dummy_dir_seed.encode()).hexdigest()[:8]

    def log(self, message: str) -> None:
        """ログメッセージをファイルに追記

        Args:
            message: ログメッセージ
        """
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] {message}\n"

        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_line)

    def info(self, message: str) -> None:
        """INFOレベルのログメッセージをファイルに追記

        Args:
            message: ログメッセージ
        """
        self.log(f"[INFO] {message}")

    def error(self, message: str) -> None:
        """ERRORレベルのログメッセージをファイルに追記

        Args:
            message: ログメッセージ
        """
        self.log(f"[ERROR] {message}")

    def get_url(self) -> str:
        """マスクされたログファイルURLを取得

        Returns:
            file:// プロトコルを使用したURL
        """
        filename = self.log_file.name
        return f"file:///{self.dummy_dir_hash}/{filename}"

    def get_file_path(self) -> str:
        """実ログファイルパスを取得

        Returns:
            実ログファイルのパス
        """
        return str(self.log_file.absolute())
