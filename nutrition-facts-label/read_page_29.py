import json
import re
from pathlib import Path

import pdfplumber


PDF_PATH = Path("table.pdf")

RESPONSE_OUTPUT_PATH = Path("data/response.json")
FOODS_OUTPUT_PATH = Path("data/foods.json")

TABLE_START_PAGE = 29
TABLE_END_PAGE = 161

FIRST_FOOD_NUMBER = 1
LAST_FOOD_NUMBER = 597

TEST_FOOD_NUMBER = 4


LINE1_NUTRIENT_FIELDS = [
    "moisture_percent",
    "energy_kcal",
    "energy_kj",
    "protein_g",
    "fat_g",
    "cholesterol_mg",
    "carbohydrates_g",
    "fiber_g",
    "ash_g",
    "calcium_mg",
    "magnesium_mg",
]


LINE2_NUTRIENT_FIELDS = [
    "manganese_mg",
    "phosphorus_mg",
    "iron_mg",
    "sodium_mg",
    "potassium_mg",
    "copper_mg",
    "zinc_mg",
    "retinol_mcg",
    "vitamin_a_re_mcg",
    "vitamin_a_rae_mcg",
    "thiamine_mg",
    "riboflavin_mg",
    "pyridoxine_mg",
    "niacin_mg",
    "vitamin_c_mg",
]


def find_food_line(
    page_text: str,
    food_number: str,
) -> str | None:
    """
    Procura uma linha que comece exatamente
    com o número do alimento.
    """
    pattern = re.compile(
        rf"^{re.escape(food_number)}\s+.+$",
        flags=re.MULTILINE,
    )

    match = pattern.search(page_text)

    return match.group(0) if match else None


def load_table_pages(
    pdf: pdfplumber.PDF,
) -> dict[int, str]:
    """
    Extrai o texto das páginas da tabela apenas uma vez.
    """
    total_pages = len(pdf.pages)

    if TABLE_START_PAGE < 1:
        raise ValueError(
            "A página inicial deve ser maior ou igual a 1."
        )

    if TABLE_END_PAGE > total_pages:
        raise ValueError(
            f"A página final configurada é {TABLE_END_PAGE}, "
            f"mas o PDF possui somente {total_pages} páginas."
        )

    pages_text: dict[int, str] = {}

    print("Carregando páginas da tabela...")

    for page_number in range(
        TABLE_START_PAGE,
        TABLE_END_PAGE + 1,
    ):
        print(
            f"\rExtraindo página "
            f"{page_number}/{TABLE_END_PAGE}",
            end="",
            flush=True,
        )

        page = pdf.pages[page_number - 1]

        pages_text[page_number] = (
            page.extract_text() or ""
        )

    print()
    print("Páginas carregadas com sucesso.")

    return pages_text


def find_food(
    pages_text: dict[int, str],
    food_number: str,
) -> tuple[int, str] | None:
    """
    Procura a primeira ocorrência do alimento.
    """
    for page_number, page_text in pages_text.items():
        food_line = find_food_line(
            page_text=page_text,
            food_number=food_number,
        )

        if food_line:
            return page_number, food_line

    return None


def find_food_on_page(
    pages_text: dict[int, str],
    page_number: int,
    food_number: str,
) -> str | None:
    """
    Procura o alimento em uma página específica.
    """
    page_text = pages_text.get(page_number, "")

    return find_food_line(
        page_text=page_text,
        food_number=food_number,
    )


def find_complete_food(
    pages_text: dict[int, str],
    food_number: str,
) -> tuple[int, str, str | None] | None:
    """
    Procura a primeira linha e sua continuação
    na página seguinte.
    """
    first_result = find_food(
        pages_text=pages_text,
        food_number=food_number,
    )

    if first_result is None:
        return None

    page_number, line1 = first_result

    line2 = find_food_on_page(
        pages_text=pages_text,
        page_number=page_number + 1,
        food_number=food_number,
    )

    return page_number, line1, line2


def parse_line1(
    food_number: int,
    line1: str,
) -> dict:
    """
    Separa a descrição e os nutrientes da primeira linha.
    """
    parts = line1.split()

    minimum_size = (
        1
        + 1
        + len(LINE1_NUTRIENT_FIELDS)
    )

    if len(parts) < minimum_size:
        raise ValueError(
            f"A line1 do alimento {food_number} "
            "não possui campos suficientes."
        )

    extracted_number = parts[0]

    if extracted_number != str(food_number):
        raise ValueError(
            f"Esperado alimento {food_number}, "
            f"mas foi encontrado {extracted_number}."
        )

    nutrient_values = parts[
        -len(LINE1_NUTRIENT_FIELDS):
    ]

    description_parts = parts[
        1:-len(LINE1_NUTRIENT_FIELDS)
    ]

    description = " ".join(description_parts)

    nutrients = dict(
        zip(
            LINE1_NUTRIENT_FIELDS,
            nutrient_values,
        )
    )

    return {
        "description": description,
        **nutrients,
    }


def parse_line2(
    food_number: int,
    line2: str,
) -> dict:
    """
    Separa os nutrientes da segunda linha.
    """
    parts = line2.split()

    expected_size = (
        1
        + len(LINE2_NUTRIENT_FIELDS)
    )

    if len(parts) != expected_size:
        raise ValueError(
            f"A line2 do alimento {food_number} deveria "
            f"possuir {expected_size} valores, "
            f"mas possui {len(parts)}."
        )

    extracted_number = parts[0]

    if extracted_number != str(food_number):
        raise ValueError(
            f"Esperado alimento {food_number}, "
            f"mas foi encontrado {extracted_number}."
        )

    nutrient_values = parts[1:]

    return dict(
        zip(
            LINE2_NUTRIENT_FIELDS,
            nutrient_values,
        )
    )


def merge_food(record: dict) -> dict:
    """
    Une line1 e line2 em um único alimento estruturado.
    """
    food_number = record["food_number"]
    page_number = record["page"]
    line1 = record["line1"]
    line2 = record["line2"]

    if line2 is None:
        raise ValueError(
            f"O alimento {food_number} não possui line2."
        )

    first_part = parse_line1(
        food_number=food_number,
        line1=line1,
    )

    second_part = parse_line2(
        food_number=food_number,
        line2=line2,
    )

    return {
        "food_number": food_number,
        "page": page_number,
        **first_part,
        **second_part,
    }


def save_json(
    output_path: Path,
    data: list[dict],
) -> None:
    """
    Salva uma lista em formato JSON.
    """
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with output_path.open(
        mode="w",
        encoding="utf-8",
    ) as file:
        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=2,
        )


def print_test_food(
    foods: list[dict],
) -> None:
    """
    Exibe no terminal o alimento configurado para teste.
    """
    test_food = next(
        (
            food
            for food in foods
            if food["food_number"] == TEST_FOOD_NUMBER
        ),
        None,
    )

    if test_food is None:
        return

    print()
    print("=" * 100)
    print(
        f"ALIMENTO ESTRUTURADO "
        f"{TEST_FOOD_NUMBER}"
    )
    print("=" * 100)

    print(
        json.dumps(
            test_food,
            ensure_ascii=False,
            indent=2,
        )
    )


def extract_foods() -> None:
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"PDF não encontrado: {PDF_PATH.resolve()}"
        )

    raw_foods: list[dict] = []
    structured_foods: list[dict] = []

    not_found: list[int] = []
    line2_not_found: list[int] = []
    parse_errors: list[int] = []

    with pdfplumber.open(PDF_PATH) as pdf:
        total_pages = len(pdf.pages)

        print(f"Total de páginas do PDF: {total_pages}")

        print(
            f"Intervalo da tabela: "
            f"{TABLE_START_PAGE} até {TABLE_END_PAGE}"
        )

        print(
            f"Alimentos: "
            f"{FIRST_FOOD_NUMBER} até {LAST_FOOD_NUMBER}"
        )

        print()

        pages_text = load_table_pages(pdf)

        print()
        print("=" * 100)
        print("BUSCANDO E ESTRUTURANDO ALIMENTOS")
        print("=" * 100)

        for food_number in range(
            FIRST_FOOD_NUMBER,
            LAST_FOOD_NUMBER + 1,
        ):
            progress = (
                f"[{food_number}/{LAST_FOOD_NUMBER}]"
            )

            result = find_complete_food(
                pages_text=pages_text,
                food_number=str(food_number),
            )

            if result is None:
                print(
                    f"{progress} ✘ Alimento não encontrado"
                )

                not_found.append(food_number)
                continue

            page_number, line1, line2 = result

            raw_food = {
                "food_number": food_number,
                "page": page_number,
                "line1": line1,
                "line2": line2,
            }

            raw_foods.append(raw_food)

            if line2 is None:
                print(
                    f"{progress} ⚠ line2 não encontrada"
                )

                line2_not_found.append(food_number)
                continue

            try:
                structured_food = merge_food(raw_food)

                structured_foods.append(
                    structured_food
                )

                print(
                    f"{progress} ✔ Estruturado"
                )

            except ValueError as error:
                print(
                    f"{progress} ✘ Erro ao estruturar: "
                    f"{error}"
                )

                parse_errors.append(food_number)

    save_json(
        output_path=RESPONSE_OUTPUT_PATH,
        data=raw_foods,
    )

    save_json(
        output_path=FOODS_OUTPUT_PATH,
        data=structured_foods,
    )

    print_test_food(structured_foods)

    print()
    print("=" * 100)
    print("RESUMO")
    print("=" * 100)

    print(
        f"Registros brutos: {len(raw_foods)}"
    )

    print(
        f"Alimentos estruturados: "
        f"{len(structured_foods)}"
    )

    print(
        f"Alimentos não encontrados: "
        f"{len(not_found)}"
    )

    print(
        f"Alimentos sem line2: "
        f"{len(line2_not_found)}"
    )

    print(
        f"Erros de estrutura: "
        f"{len(parse_errors)}"
    )

    print(
        f"Arquivo bruto: "
        f"{RESPONSE_OUTPUT_PATH.resolve()}"
    )

    print(
        f"Arquivo estruturado: "
        f"{FOODS_OUTPUT_PATH.resolve()}"
    )

    if not_found:
        print(
            "Não encontrados: "
            + ", ".join(
                str(number)
                for number in not_found
            )
        )

    if line2_not_found:
        print(
            "Sem line2: "
            + ", ".join(
                str(number)
                for number in line2_not_found
            )
        )

    if parse_errors:
        print(
            "Erros de estrutura: "
            + ", ".join(
                str(number)
                for number in parse_errors
            )
        )


if __name__ == "__main__":
    extract_foods()
