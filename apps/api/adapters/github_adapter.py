"""
GitHub adapter for fetching JSON files from raw.githubusercontent.com.
Simple, lightweight adapter for public repositories.
"""

from typing import Any, List, Union
import requests


class GitHubAdapter:
    """Adapter for fetching JSON files from GitHub raw URLs."""

    def get_json_from_url(self, url: str, timeout: int = 30) -> Union[dict, list]:
        """
        Fetch and parse JSON file from a raw GitHub URL.

        Args:
            url: Full raw GitHub URL (e.g., https://raw.githubusercontent.com/owner/repo/branch/path/file.json)
            timeout: Request timeout in seconds

        Returns:
            Parsed JSON content (dict or list)

        Raises:
            ValueError: If request fails or invalid JSON
        """
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            return response.json()
        except requests.HTTPError as e:
            raise ValueError(f"Failed to fetch from GitHub: {e.response.status_code} - {e.response.reason}")
        except requests.Timeout:
            raise ValueError(f"Request timed out after {timeout} seconds")
        except requests.RequestException as e:
            raise ValueError(f"Request failed: {str(e)}")
        except ValueError as e:
            raise ValueError(f"Invalid JSON response: {str(e)}")

    def get_json_file(
        self,
        owner: str,
        repo: str,
        file_path: str,
        ref: str = "main",
        timeout: int = 30
    ) -> Union[dict, list]:
        """
        Fetch JSON file from GitHub repository.

        Args:
            owner: Repository owner
            repo: Repository name
            file_path: Path to JSON file (e.g., "nasdaq/nasdaq_full_tickers.json")
            ref: Branch, tag, or commit (default: "main")
            timeout: Request timeout in seconds

        Returns:
            Parsed JSON content

        Example:
            adapter = GitHubAdapter()
            data = adapter.get_json_file("rreichel3", "US-Stock-Symbols", "nasdaq/nasdaq_full_tickers.json")
        """
        url = f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{file_path.lstrip('/')}"
        return self.get_json_from_url(url, timeout)
