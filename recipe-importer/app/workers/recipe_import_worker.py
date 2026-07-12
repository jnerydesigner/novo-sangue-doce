import ipaddress
import socket
from urllib.parse import urljoin, urlsplit

import httpx
from bs4 import BeautifulSoup

from app.schemas.recipe import ImportRecipeResponse
from app.scrapers.json_ld import JsonLdRecipeScraper
from app.services.duplicate_detector import recipe_fingerprint
from app.services.recipe_normalizer import normalize_recipe
from app.services.robots_checker import RobotsChecker, USER_AGENT

MAX_RESPONSE_BYTES = 3 * 1024 * 1024
MAX_REDIRECTS = 5


class UnsafeUrlError(ValueError):
    pass


def assert_safe_url(url: str) -> None:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise UnsafeUrlError("Use uma URL HTTP ou HTTPS válida.")
    if parsed.username or parsed.password:
        raise UnsafeUrlError("URLs com credenciais não são permitidas.")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, parsed.port or (443 if parsed.scheme == "https" else 80), type=socket.SOCK_STREAM)
    except socket.gaierror as error:
        raise UnsafeUrlError("Não foi possível resolver o domínio informado.") from error
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            raise UnsafeUrlError("A URL aponta para uma rede privada ou reservada.")


class RecipeImportWorker:
    def __init__(self) -> None:
        self.client = httpx.Client(
            timeout=httpx.Timeout(15, connect=5),
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"},
            follow_redirects=False,
        )
        self.robots = RobotsChecker(self.client)
        self.scrapers = [JsonLdRecipeScraper()]

    def import_url(self, url: str) -> ImportRecipeResponse:
        final_url, html = self._fetch(url)
        soup = BeautifulSoup(html, "html.parser")
        for scraper in self.scrapers:
            extracted = scraper.extract(soup, final_url)
            if extracted is None:
                continue
            if extracted.canonical_url:
                extracted.canonical_url = urljoin(final_url, extracted.canonical_url)
            if extracted.image:
                extracted.image = urljoin(final_url, extracted.image)
            recipe, warnings, confidence = normalize_recipe(extracted)
            return ImportRecipeResponse(
                recipe=recipe,
                warnings=warnings,
                confidence=confidence,
                fingerprint=recipe_fingerprint(recipe),
                extractor=scraper.name,
            )
        raise ValueError("Nenhuma receita estruturada em JSON-LD foi encontrada.")

    def _fetch(self, url: str) -> tuple[str, bytes]:
        current = url
        for _ in range(MAX_REDIRECTS + 1):
            assert_safe_url(current)
            self.robots.assert_allowed(current)
            with self.client.stream("GET", current) as response:
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        raise ValueError("O site retornou um redirecionamento inválido.")
                    current = urljoin(current, location)
                    continue
                response.raise_for_status()
                content_type = response.headers.get("content-type", "").lower()
                if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                    raise ValueError("A URL não retornou uma página HTML.")
                chunks: list[bytes] = []
                size = 0
                for chunk in response.iter_bytes():
                    size += len(chunk)
                    if size > MAX_RESPONSE_BYTES:
                        raise ValueError("A página excede o limite de 3 MB.")
                    chunks.append(chunk)
                return str(response.url), b"".join(chunks)
        raise ValueError("A URL excedeu o limite de redirecionamentos.")

    def close(self) -> None:
        self.client.close()
