"""GitHub API関連のコア機能"""

import json
import re
import subprocess
from typing import Any, Optional


def get_git_remote_info() -> tuple[Optional[str], Optional[str]]:
    """Gitのremote originからオーナーとリポジトリ名を取得

    Returns:
        (owner, repo)のタプル。取得できない場合はNoneを返す
    """
    try:
        result = subprocess.run(
            ["git", "config", "--get", "remote.origin.url"],
            capture_output=True,
            text=True,
            check=True,
        )
        remote_url = result.stdout.strip()

        match = re.search(r"github\.com[/:]([\w-]+)/([\w-]+?)(?:\.git)?$", remote_url)
        if match:
            return match.group(1), match.group(2)
        return None, None

    except subprocess.CalledProcessError:
        return None, None


def query_github_project(
    owner: str, repo: str, project_number: int
) -> dict[str, Any]:
    """GitHub Project V2のアイテムをGraphQL APIで取得

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        project_number: プロジェクト番号

    Returns:
        APIレスポンスのデータ部分

    Raises:
        subprocess.CalledProcessError: gh APIコマンドが失敗した場合
        json.JSONDecodeError: レスポンスが無効なJSONの場合
        RuntimeError: APIがエラーを返した場合
    """
    query = """
    query($owner:String!, $repo:String!, $number:Int!) {
      repository(owner: $owner, name: $repo) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                  title
                  url
                  state
                }
                ... on PullRequest {
                  number
                  title
                  url
                  state
                }
              }
              fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
              }
            }
          }
        }
      }
    }
    """

    result = subprocess.run(
        [
            "gh",
            "api",
            "graphql",
            "-f",
            f"query={query}",
            "-F",
            f"owner={owner}",
            "-F",
            f"repo={repo}",
            "-F",
            f"number={project_number}",
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    data = json.loads(result.stdout)

    if "errors" in data:
        errors = data["errors"]
        error_msg = ", ".join(e.get("message", str(e)) for e in errors)
        raise RuntimeError(f"GitHub API error: {error_msg}")

    return data.get("data", {})


def extract_tickets(api_data: dict[str, Any]) -> list[dict[str, Any]]:
    """APIレスポンスからチケット情報を抽出

    Args:
        api_data: query_github_projectからの返り値

    Returns:
        チケット情報のリスト
    """
    items = (
        api_data.get("repository", {})
        .get("projectV2", {})
        .get("items", {})
        .get("nodes", [])
    )

    tickets = []
    for item in items:
        content = item.get("content", {})
        if not content:
            continue

        field_value_by_name = item.get("fieldValueByName", {})
        item_status = field_value_by_name.get("name") if field_value_by_name else None

        ticket = {
            "number": content.get("number"),
            "title": content.get("title"),
            "url": content.get("url"),
            "state": content.get("state"),
            "status": item_status,
        }
        tickets.append(ticket)

    return tickets


def filter_by_status(
    tickets: list[dict[str, Any]], status: Optional[str] = None
) -> list[dict[str, Any]]:
    """チケットをStatusでフィルタリング

    Args:
        tickets: チケット情報のリスト
        status: フィルタリング対象のStatus（Noneの場合はフィルタリングしない）

    Returns:
        フィルタリング済みのチケットリスト
    """
    if not status:
        return tickets

    return [ticket for ticket in tickets if ticket.get("status") == status]


def fetch_tickets(
    owner: str, repo: str, project_number: int, status: Optional[str] = None
) -> list[dict[str, Any]]:
    """GitHub Projectから指定されたStatusのチケットを取得

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        project_number: プロジェクト番号
        status: フィルタリング対象のStatus（Noneの場合はすべて取得）

    Returns:
        チケット情報のリスト
    """
    api_data = query_github_project(owner, repo, project_number)
    tickets = extract_tickets(api_data)
    return filter_by_status(tickets, status)


def get_project_info(
    owner: str, repo: str, project_number: int
) -> dict[str, Any]:
    """プロジェクト情報（ID、フィールド情報）を取得

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        project_number: プロジェクト番号

    Returns:
        プロジェクト情報

    Raises:
        RuntimeError: APIがエラーを返した場合
    """
    query = """
    query($owner:String!, $repo:String!, $number:Int!) {
      repository(owner: $owner, name: $repo) {
        projectV2(number: $number) {
          id
          fields(first: 20) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
    """

    result = subprocess.run(
        [
            "gh",
            "api",
            "graphql",
            "-f",
            f"query={query}",
            "-F",
            f"owner={owner}",
            "-F",
            f"repo={repo}",
            "-F",
            f"number={project_number}",
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    data = json.loads(result.stdout)

    if "errors" in data:
        errors = data["errors"]
        error_msg = ", ".join(e.get("message", str(e)) for e in errors)
        raise RuntimeError(f"GitHub API error: {error_msg}")

    return data.get("data", {}).get("repository", {}).get("projectV2", {})


def get_issue_item_id(
    owner: str, repo: str, project_number: int, issue_number: int
) -> Optional[str]:
    """Issueに対応するProjectV2 ItemのIDを取得

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        project_number: プロジェクト番号
        issue_number: Issue番号

    Returns:
        ItemのID（見つからない場合はNone）

    Raises:
        RuntimeError: APIがエラーを返した場合
    """
    query = """
    query($owner:String!, $repo:String!, $number:Int!) {
      repository(owner: $owner, name: $repo) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                }
              }
            }
          }
        }
      }
    }
    """

    result = subprocess.run(
        [
            "gh",
            "api",
            "graphql",
            "-f",
            f"query={query}",
            "-F",
            f"owner={owner}",
            "-F",
            f"repo={repo}",
            "-F",
            f"number={project_number}",
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    data = json.loads(result.stdout)

    if "errors" in data:
        errors = data["errors"]
        error_msg = ", ".join(e.get("message", str(e)) for e in errors)
        raise RuntimeError(f"GitHub API error: {error_msg}")

    items = (
        data.get("data", {})
        .get("repository", {})
        .get("projectV2", {})
        .get("items", {})
        .get("nodes", [])
    )

    for item in items:
        content = item.get("content", {})
        if content.get("number") == issue_number:
            return item.get("id")

    return None


def get_issue_details(owner: str, repo: str, issue_number: int) -> dict[str, Any]:
    """Issue詳細情報を取得

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        issue_number: Issue番号

    Returns:
        Issue詳細情報

    Raises:
        RuntimeError: APIがエラーを返した場合
    """
    query = """
    query($owner:String!, $repo:String!, $number:Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          number
          title
          body
          state
          createdAt
          updatedAt
          author {
            login
          }
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
    """

    result = subprocess.run(
        [
            "gh",
            "api",
            "graphql",
            "-f",
            f"query={query}",
            "-F",
            f"owner={owner}",
            "-F",
            f"repo={repo}",
            "-F",
            f"number={issue_number}",
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    data = json.loads(result.stdout)

    if "errors" in data:
        errors = data["errors"]
        error_msg = ", ".join(e.get("message", str(e)) for e in errors)
        raise RuntimeError(f"GitHub API error: {error_msg}")

    issue = data.get("data", {}).get("repository", {}).get("issue", {})

    if not issue:
        raise RuntimeError(f"Issue #{issue_number} が見つかりません")

    return {
        "number": issue.get("number"),
        "title": issue.get("title"),
        "body": issue.get("body", ""),
        "state": issue.get("state"),
        "created_at": issue.get("createdAt"),
        "updated_at": issue.get("updatedAt"),
        "author": issue.get("author", {}).get("login"),
        "labels": [label.get("name") for label in issue.get("labels", {}).get("nodes", [])],
    }


def update_ticket_status(
    owner: str,
    repo: str,
    project_number: int,
    issue_number: int,
    new_status: str,
) -> None:
    """チケットのStatusを更新

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        project_number: プロジェクト番号
        issue_number: Issue番号
        new_status: 新しいStatus

    Raises:
        RuntimeError: APIがエラーを返した場合またはアイテムが見つからない場合
    """
    # プロジェクト情報を取得
    project_info = get_project_info(owner, repo, project_number)
    project_id = project_info.get("id")

    if not project_id:
        raise RuntimeError("プロジェクトが見つかりません")

    # Statusフィールド情報を取得
    status_field = None
    fields = project_info.get("fields", {}).get("nodes", [])
    for field in fields:
        if field.get("name") == "Status":
            status_field = field
            break

    if not status_field:
        raise RuntimeError("Statusフィールドが見つかりません")

    field_id = status_field.get("id")
    options = status_field.get("options", [])

    # 指定されたStatusのオプションIDを取得
    option_id = None
    for option in options:
        if option.get("name") == new_status:
            option_id = option.get("id")
            break

    if not option_id:
        raise RuntimeError(
            f"Status '{new_status}' が見つかりません。"
            f"利用可能: {', '.join(opt.get('name', '') for opt in options)}"
        )

    # Issueのアイテムを取得
    item_id = get_issue_item_id(owner, repo, project_number, issue_number)

    if not item_id:
        raise RuntimeError(f"Issue #{issue_number} がプロジェクトで見つかりません")

    # Statusを更新
    mutation = f"""
    mutation {{
      updateProjectV2ItemFieldValue(
        input: {{
          projectId: "{project_id}"
          itemId: "{item_id}"
          fieldId: "{field_id}"
          value: {{singleSelectOptionId: "{option_id}"}}
        }}
      ) {{
        projectV2Item {{
          id
        }}
      }}
    }}
    """

    result = subprocess.run(
        [
            "gh",
            "api",
            "graphql",
            "-f",
            f"query={mutation}",
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"GitHub API error: {result.stderr if result.stderr else result.stdout}"
        )

    data = json.loads(result.stdout)

    if "errors" in data:
        errors = data["errors"]
        error_msg = ", ".join(e.get("message", str(e)) for e in errors)
        raise RuntimeError(f"GitHub API error: {error_msg}")


def post_issue_comment(
    owner: str, repo: str, issue_number: int, body: str
) -> dict[str, Any]:
    """Issue にコメントを投稿

    Args:
        owner: リポジトリオーナー
        repo: リポジトリ名
        issue_number: Issue番号
        body: コメント本文

    Returns:
        投稿されたコメント情報

    Raises:
        RuntimeError: APIがエラーを返した場合
    """
    # gh CLI で直接コメントを投稿（より簡単）
    result = subprocess.run(
        [
            "gh",
            "issue",
            "comment",
            str(issue_number),
            "--body",
            body,
            "--repo",
            f"{owner}/{repo}",
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Failed to post comment: {result.stderr if result.stderr else result.stdout}"
        )

    return {"status": "success"}
