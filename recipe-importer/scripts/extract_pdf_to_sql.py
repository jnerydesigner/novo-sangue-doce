#!/usr/bin/env python3
"""Extract the indexed recipes from the Sangue Doce recipe book into SQL."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import unicodedata
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Entry:
    title: str
    printed_page: int
    category: str


ENTRIES = [
    Entry("Panini com geleia artesanal e suco verde", 18, "Desjejum"),
    Entry("Smoothie refrescante de banana com morango", 20, "Desjejum"),
    Entry("Aipim cozido com ghee acompanhado por suco rosa", 22, "Desjejum"),
    Entry("Muesli da estação", 24, "Desjejum"),
    Entry("Tapioca caipira + Suco nutritivo", 26, "Desjejum"),
    Entry("Cupcake de coco e cacau + café batido com óleo de coco", 28, "Desjejum"),
    Entry("Granola caseira", 30, "Desjejum"),
    Entry("Cookie de grão de bico", 34, "Colação"),
    Entry("Palitinhos crocantes", 35, "Colação"),
    Entry("Danete cremoso de chocolate", 36, "Colação"),
    Entry("Biscoitinhos de banana e aveia", 38, "Colação"),
    Entry("Sementinhas de abóbora torradas", 40, "Colação"),
    Entry("Barrinhas de cereal vapt-vupt", 42, "Colação"),
    Entry("Biscoitinhos de mel", 44, "Colação"),
    Entry("Salada de bacalhau com feijão fradinho e banana da terra", 48, "Almoço"),
    Entry("Nhoque de baroa com molho de manteiga e sálvia + Salada especial", 50, "Almoço"),
    Entry("Picadinho à jardineira com farofa de beterraba", 56, "Almoço"),
    Entry("Empadão de grão de bico", 58, "Almoço"),
    Entry("Arroz com couve-flor + frango com pimentões", 60, "Almoço"),
    Entry("Escondidinho de baroa ao creme de frango", 62, "Almoço"),
    Entry("Salada de atum com quinoa no pote", 64, "Almoço"),
    Entry("Bolo de cenoura da vovó", 68, "Lanche"),
    Entry("Pão de queijo de mandioquinha", 70, "Lanche"),
    Entry("Biscoitinhos de aveia com creme de cacau", 72, "Lanche"),
    Entry("Muffin de ricota com tomatinho", 74, "Lanche"),
    Entry("Cuca crocante integral", 76, "Lanche"),
    Entry("Chips de legumes", 78, "Lanche"),
    Entry("Panqueca doce de forno", 80, "Lanche"),
    Entry("Ensopado vegetariano", 84, "Jantar"),
    Entry("Linguado com crosta de castanhas", 86, "Jantar"),
    Entry("Quibe vegano de abóbora com quinoa + Salada especial", 88, "Jantar"),
    Entry("Suflê colorido de frango", 90, "Jantar"),
    Entry("Sopa de legumes", 92, "Jantar"),
    Entry("Espaguete de abobrinha", 94, "Jantar"),
    Entry("Omelete funcional colorido", 96, "Jantar"),
    Entry("Abacate com limão e mel", 100, "Ceia"),
    Entry("Sagu funcional de chia com alfarroba", 102, "Ceia"),
    Entry("Banana quentinha com canela", 104, "Ceia"),
    Entry("Nuts caramelizadas", 106, "Ceia"),
    Entry("Pudim de manga", 108, "Ceia"),
    Entry("Maçã assada com canela", 109, "Ceia"),
    Entry("Mingau delícia de coco", 110, "Ceia"),
    Entry("X-tudo saudável", 114, "Extras de final de semana"),
    Entry("Pastel integral", 116, "Extras de final de semana"),
    Entry("Ceviche + chips de legumes", 118, "Extras de final de semana"),
    Entry("Tortinha de chocolate e nuts", 120, "Extras de final de semana"),
    Entry("Brownie funcional", 122, "Extras de final de semana"),
    Entry("Docinho de frutas secas", 124, "Extras de final de semana"),
    Entry("Sorvete de banana com cacau", 126, "Extras de final de semana"),
]

STOP_LABELS = re.compile(
    r"\n(?:Custo|Valor|Rendimento|Serve|Característica|Características|Dica|Observação|Pulo do gato|Receita suco da foto)\s*:?",
    re.IGNORECASE,
)


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFD", value)
    return "".join(char for char in value if unicodedata.category(char) != "Mn").casefold()


def slugify(value: str) -> str:
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", normalize(value)))


def pdf_page(printed_page: int) -> int:
    return printed_page // 2 + 1


def page_text(pdf: Path, page: int) -> str:
    result = subprocess.run(
        ["pdftotext", "-f", str(page), "-l", str(page), "-raw", str(pdf), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.replace("\u000c", "\n")


def clean_line(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip(" ;•\t")
    if re.match(r"^(\d+\s*\|\s*50 receitas|50 receitas que)", value, re.IGNORECASE):
        return ""
    return value


def regions(text: str, start_label: str, end_label: str | None) -> list[str]:
    start = re.compile(start_label, re.IGNORECASE)
    end = re.compile(end_label, re.IGNORECASE) if end_label else None
    matches = list(start.finditer(text))
    output: list[str] = []
    for match in matches:
        tail = text[match.end() :]
        end_match = end.search(tail) if end else None
        region = tail[: end_match.start()] if end_match else tail
        stop = STOP_LABELS.search(region)
        output.append(region[: stop.start()] if stop else region)
    return output


def ingredients_from(text: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    for region in regions(text, r"Ingredientes\s*:", r"Modo de preparo\s*:"):
        for raw in re.split(r"[;\n]+", region):
            line = clean_line(raw)
            if len(line) < 2 or line.casefold().startswith(("tempo de preparo", "característica")):
                continue
            items.append({"quantity": None, "unit": None, "name": line, "note": None})
    return items


def instructions_from(text: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    for region in regions(text, r"Modo de preparo\s*:", None):
        paragraphs = re.split(r"(?:;\s*|\n(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]))", region)
        for raw in paragraphs:
            line = clean_line(raw)
            if len(line) < 8 or line.casefold().startswith(("ingredientes", "tempo de preparo")):
                continue
            items.append({"title": None, "description": line})
    return items


def minutes_from(text: str) -> int:
    match = re.search(r"Tempo de preparo\s*:?\s*(\d+)\s*(?:h|hora)", text, re.IGNORECASE)
    hours = int(match.group(1)) * 60 if match else 0
    minute_match = re.search(r"Tempo de preparo[^\n]{0,40}?(\d+)\s*min", text, re.IGNORECASE)
    minutes = int(minute_match.group(1)) if minute_match else 0
    return max(1, hours + minutes)


def servings_from(text: str) -> tuple[int, str | None]:
    match = re.search(r"(?:Rendimento|Serve)\s*:?\s*([^\n.]+)", text, re.IGNORECASE)
    if not match:
        return 4, None
    label = clean_line(match.group(1))
    number = re.search(r"\d+", label)
    return max(1, int(number.group())) if number else 4, label or None


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def json_literal(value: object) -> str:
    return sql_literal(json.dumps(value, ensure_ascii=False)) + "::jsonb"


def extract(pdf: Path) -> list[dict[str, object]]:
    page_cache: dict[int, str] = {}
    extracted: list[dict[str, object]] = []
    for entry in ENTRIES:
        page = pdf_page(entry.printed_page)
        text = page_cache.setdefault(page, page_text(pdf, page))
        same_page = [item for item in ENTRIES if pdf_page(item.printed_page) == page]
        positions = []
        normalized_text = normalize(text)
        for item in same_page:
            positions.append((normalized_text.find(normalize(item.title)), item))
        positions = sorted((position, item) for position, item in positions if position >= 0)
        if len(positions) > 1:
            own_index = next((index for index, (_, item) in enumerate(positions) if item == entry), 0)
            left = 0 if own_index == 0 else (positions[own_index - 1][0] + positions[own_index][0]) // 2
            right = len(text) if own_index == len(positions) - 1 else (positions[own_index][0] + positions[own_index + 1][0]) // 2
            block = text[left:right]
        else:
            block = text
        ingredients = ingredients_from(block)
        instructions = instructions_from(block)
        # Keep imports valid and visibly reviewable when the PDF layout defeats text extraction.
        if not ingredients:
            ingredients = [{"quantity": None, "unit": None, "name": "Revisar ingredientes na página original do livro", "note": f"Página {entry.printed_page}"}]
        if not instructions:
            instructions = [{"title": None, "description": f"Revisar o modo de preparo na página {entry.printed_page} do livro."}]
        servings, serving_size = servings_from(block)
        extracted.append({
            "title": entry.title,
            "slug": slugify(entry.title),
            "category": entry.category,
            "page": entry.printed_page,
            "prep_minutes": minutes_from(block),
            "servings": servings,
            "serving_size": serving_size,
            "ingredients": ingredients,
            "instructions": instructions,
        })
    return extracted


def build_sql(recipes: list[dict[str, object]], source: Path) -> str:
    lines = [
        "-- Generated from 50_receitas.pdf. Review all DRAFT records before publication.",
        "-- The source PDF remains the authority for layout-sensitive ingredients and instructions.",
        "BEGIN;",
        "",
        "-- ================================================================",
        "-- CONFIGURE OS DOIS UUIDs ABAIXO ANTES DE EXECUTAR O ARQUIVO",
        "-- ================================================================",
    ]
    lines.extend([
        "DO $$",
        "DECLARE",
        "  -- Exemplo: 'b1c86db2-be62-421d-85e1-725734750219'::uuid",
        "  selected_author UUID := NULL; -- COLOQUE O authorId AQUI",
        "  selected_category UUID := NULL; -- COLOQUE O categoryId AQUI",
        "BEGIN",
        "  IF selected_author IS NULL OR selected_category IS NULL THEN",
        "    RAISE EXCEPTION 'Preencha selected_author e selected_category no inicio do extraction.sql';",
        "  END IF;",
        "  IF NOT EXISTS (SELECT 1 FROM \"recipe_authors\" WHERE \"id\" = selected_author) THEN",
        "    RAISE EXCEPTION 'O authorId informado nao existe em recipe_authors';",
        "  END IF;",
        "  IF NOT EXISTS (SELECT 1 FROM \"recipe_categories\" WHERE \"id\" = selected_category) THEN",
        "    RAISE EXCEPTION 'O categoryId informado nao existe em recipe_categories';",
        "  END IF;",
    ])
    for recipe in recipes:
        excerpt = f"Receita extraída do livro “50 receitas que nutrem o corpo e a alma de toda a família”, página {recipe['page']}. Conteúdo importado para revisão editorial."
        content = [{"type": "callout", "title": "Fonte da extração", "content": f"Livro 50 receitas que nutrem o corpo e a alma de toda a família, página {recipe['page']}. Revise o conteúdo antes de publicar."}]
        lines.extend([
            "  INSERT INTO \"recipes\" (",
            "    \"id\", \"slug\", \"title\", \"excerpt\", \"content\", \"status\", \"featured\",",
            "    \"reading_minutes\", \"cover_image_url\", \"meta_title\", \"meta_description\",",
            "    \"prep_minutes\", \"cook_minutes\", \"servings\", \"serving_size\", \"difficulty\",",
            "    \"ingredients\", \"instructions\", \"author_id\", \"category_id\", \"created_at\", \"updated_at\"",
            "  ) VALUES (",
            f"    gen_random_uuid(), {sql_literal(str(recipe['slug']))}, {sql_literal(str(recipe['title']))}, {sql_literal(excerpt)}, {json_literal(content)}, 'DRAFT', false,",
            f"    5, '/no-image.png', {sql_literal(str(recipe['title']))}, {sql_literal(excerpt)},",
            f"    {recipe['prep_minutes']}, 0, {recipe['servings']}, {sql_literal(str(recipe['serving_size'])) if recipe['serving_size'] else 'NULL'}, 'EASY',",
            f"    {json_literal(recipe['ingredients'])}, {json_literal(recipe['instructions'])}, selected_author, selected_category, NOW(), NOW()",
            "  ) ON CONFLICT (\"slug\") DO NOTHING;",
        ])
    lines.extend(["END $$;", "", "COMMIT;", "", f"-- Source used during generation: {source}"])
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if not args.pdf.exists():
        raise SystemExit(f"PDF not found: {args.pdf}")
    recipes = extract(args.pdf)
    args.output.write_text(build_sql(recipes, args.pdf), encoding="utf-8")
    incomplete = sum(1 for recipe in recipes if "Revisar" in json.dumps(recipe, ensure_ascii=False))
    print(f"Generated {len(recipes)} recipes in {args.output} ({incomplete} need manual PDF review).")


if __name__ == "__main__":
    main()
