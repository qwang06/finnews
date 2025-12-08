"""
Adapters package for external API integrations.
"""

from .github_adapter import GitHubAdapter
from .tiingo_adapter import TiingoClient

__all__ = ["GitHubAdapter", "TiingoClient"]
