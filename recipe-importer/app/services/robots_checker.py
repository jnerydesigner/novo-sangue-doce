from urllib.parse import urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser

import httpx

USER_AGENT = "SangueDoceRecipeImporter/1.0"


class RobotsDeniedError(ValueError):
    pass


class RobotsChecker:
    def __init__(self, client: httpx.Client):
        self.client = client
        self._cache: dict[str, RobotFileParser] = {}

    def assert_allowed(self, url: str) -> None:
        parsed = urlsplit(url)
        origin = urlunsplit((parsed.scheme, parsed.netloc, "", "", ""))
        parser = self._cache.get(origin)
        if parser is None:
            robots_url = f"{origin}/robots.txt"
            parser = RobotFileParser(robots_url)
            try:
                response = self.client.get(robots_url, headers={"User-Agent": USER_AGENT})
                parser.parse(response.text.splitlines() if response.status_code == 200 else [])
            except httpx.HTTPError:
                parser.parse([])
            self._cache[origin] = parser
        if not parser.can_fetch(USER_AGENT, url):
            raise RobotsDeniedError("O site de origem não permite esta coleta em robots.txt.")
