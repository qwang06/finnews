"""
Base adapter class for all external API clients.
Defines common interface and shared functionality.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import requests
from requests.exceptions import RequestException, HTTPError, Timeout


class BaseAdapter(ABC):
    """
    Abstract base class for API adapters.

    Provides common HTTP request handling and error management.
    All adapters should inherit from this class.
    """

    def __init__(self, base_url: str, api_key: Optional[str] = None):
        """
        Initialize the adapter.

        Args:
            base_url: Base URL for the API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = self._create_session()

    def _create_session(self) -> requests.Session:
        """Create and configure HTTP session."""
        session = requests.Session()
        session.headers.update(self._get_default_headers())
        return session

    def _get_default_headers(self) -> Dict[str, str]:
        """
        Get default headers for requests.
        Override in subclasses to add custom headers.
        """
        headers = {
            "Accept": "application/json",
            "User-Agent": "FinNews/1.0.0"
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        return headers

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        timeout: int = 30
    ) -> Dict[str, Any]:
        """
        Make HTTP request with error handling.

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint (will be appended to base_url)
            params: Query parameters
            data: Request body data
            timeout: Request timeout in seconds

        Returns:
            JSON response as dictionary

        Raises:
            RequestException: On network errors
            HTTPError: On HTTP errors
            ValueError: On invalid response
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=data,
                timeout=timeout
            )
            response.raise_for_status()
            return response.json()

        except HTTPError as e:
            self._handle_http_error(e)
        except Timeout:
            raise RequestException(f"Request to {url} timed out after {timeout} seconds")
        except RequestException as e:
            raise RequestException(f"Request failed: {str(e)}")
        except ValueError as e:
            raise ValueError(f"Invalid JSON response: {str(e)}")

    def _handle_http_error(self, error: HTTPError):
        """
        Handle HTTP errors with meaningful messages.
        Override in subclasses for custom error handling.
        """
        status_code = error.response.status_code

        if status_code == 404:
            raise ValueError("Resource not found")
        elif status_code == 401:
            raise ValueError("Unauthorized - check API credentials")
        elif status_code == 403:
            raise ValueError("Forbidden - insufficient permissions")
        elif status_code == 429:
            raise ValueError("Rate limit exceeded - please try again later")
        else:
            raise ValueError(f"HTTP {status_code}: {error.response.text}")

    @abstractmethod
    def test_connection(self) -> bool:
        """
        Test if connection to API is working.
        Must be implemented by subclasses.
        """
        pass

    def close(self):
        """Close the HTTP session."""
        if self.session:
            self.session.close()
