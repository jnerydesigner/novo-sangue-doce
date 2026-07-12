from abc import ABC, abstractmethod

from bs4 import BeautifulSoup

from app.schemas.recipe import ExtractedRecipe


class RecipeScraper(ABC):
    name: str

    @abstractmethod
    def extract(self, soup: BeautifulSoup, source_url: str) -> ExtractedRecipe | None:
        raise NotImplementedError
