"""Consolida as Tabelas 1, 2 e 3 da TACO em um único JSON.

O PDF apresenta cada tabela em duas páginas: a primeira contém a descrição
e a primeira metade das colunas; a segunda contém o restante das colunas.
Como o extrator de texto omite células vazias (NA/Tr), as linhas brutas são
preservadas para não deslocar valores entre colunas.
"""

import json
import re
import unicodedata
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).parent
PDF_PATH = ROOT / "table.pdf"
OUTPUT_PATH = ROOT / "data" / "foods-consolidated.json"

TABLE_RANGES = {
    "table_1": (29, 68),
    "table_2": (71, 100),
    "table_3": (103, 104),
}

T1_PRIMARY = ["moisture_percent", "energy_kcal", "energy_kj", "protein_g", "fat_g", "cholesterol_mg", "carbohydrates_g", "fiber_g", "ash_g", "calcium_mg", "magnesium_mg"]
T1_SECONDARY = ["manganese_mg", "phosphorus_mg", "iron_mg", "sodium_mg", "potassium_mg", "copper_mg", "zinc_mg", "retinol_mcg", "vitamin_a_re_mcg", "vitamin_a_rae_mcg", "thiamine_mg", "riboflavin_mg", "pyridoxine_mg", "niacin_mg", "vitamin_c_mg"]
PRIMARY_X = [387, 421, 447, 484, 523, 564, 601, 641, 679, 709, 748]
SECONDARY_X = [139, 191, 231, 273, 324, 362, 398, 435, 474, 513, 552, 601, 655, 698, 744]


def nearest_value(words, x):
    candidates = [word for word in words if abs(word["x0"] - x) < 20]
    return candidates[0]["text"] if candidates else None


def extract_table1(pdf):
    records = {}
    for page_number in range(29, 69):
        words = pdf.pages[page_number - 1].extract_words()
        rows = {}
        for word in words:
            if 75 <= word["x0"] <= 110 and re.fullmatch(r"\d{1,3}", word["text"]):
                code = int(word["text"])
                if 1 <= code <= 597:
                    rows.setdefault(code, []).append(word)
        for code, code_words in rows.items():
            y = code_words[0]["top"]
            line = [w for w in words if abs(w["top"] - y) < 1.5]
            if page_number % 2 == 1:
                description = " ".join(w["text"] for w in line if 115 <= w["x0"] < 380)
                record = records.setdefault(code, {"food_number": code, "page": page_number})
                if description and "description" not in record:
                    record["description"] = description
                for field, x in zip(T1_PRIMARY, PRIMARY_X):
                    value = nearest_value(line, x)
                    if value is not None and field not in record:
                        record[field] = value
            else:
                record = records.setdefault(code, {"food_number": code, "page": page_number - 1})
                for field, x in zip(T1_SECONDARY, SECONDARY_X):
                    value = nearest_value(line, x)
                    if value is not None and field not in record:
                        record[field] = value
    return records

ROW_RE = re.compile(r"^(\d+)\s+(.+?)\s*$")


def rows_from_page(text: str) -> dict[str, str]:
    rows: dict[str, str] = {}
    for line in text.splitlines():
        line = " ".join(line.split())
        match = ROW_RE.match(line)
        if match:
            code, body = match.groups()
            # Cabeçalhos e números de página não são linhas de alimento.
            if 1 <= int(code) <= 597 and body:
                rows[code] = body
    return rows


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip().lower())
    return value.strip("_")


def collect_table(pdf: pdfplumber.PDF, start: int, end: int) -> dict[str, dict]:
    collected: dict[str, dict] = {}
    current_category = "uncategorized"
    for page_number in range(start, end + 1):
        text = pdf.pages[page_number - 1].extract_text() or ""
        rows = rows_from_page(text)
        page_category = None
        for line in text.splitlines():
            line = " ".join(line.split())
            if re.match(r"^\d+\s+", line):
                break
            if line in {"Umidade", "Energia", "Proteína", "Lipídeos", "Colesterol", "Carboidrato", "Fibra Alimentar", "Cinzas", "Cálcio", "Magnésio", "Manganês", "Fósforo", "Ferro", "Sódio", "Potássio", "Cobre", "Zinco", "Retinol", "RE", "RAE", "Vitamina", "Vitamina C", "Ácidos graxos", "Aminoácidos"}:
                break
            if not line or line.startswith("Tabela ") or line.startswith("Número") or line in {"Alimento", "Descrição dos alimentos"}:
                continue
            if not re.match(r"^\d+\s+", line) and not re.search(r"\(.*\)", line) and len(line) < 80:
                page_category = slugify(line)
        if page_category:
            current_category = page_category
        for code, raw in rows.items():
            entry = collected.setdefault(code, {"food_number": int(code)})
            entry["category"] = current_category
            key = "rows"
            entry.setdefault(key, []).append({"page": page_number, "raw": raw})
    return collected


def main() -> None:
    with pdfplumber.open(PDF_PATH) as pdf:
        table1_structured = extract_table1(pdf)
        tables = {
            name: collect_table(pdf, start, end)
            for name, (start, end) in TABLE_RANGES.items()
        }

    codes = sorted(
        set().union(*(table.keys() for table in tables.values())),
        key=int,
    )
    foods = []
    for incremental_id, code in enumerate(codes, start=1):
        item = {
            "id": incremental_id,
            "food_number": int(code),
            "food_id": incremental_id,
        }
        item.update(table1_structured.get(int(code), {}))
        # As tabelas 2 e 3 serão incorporadas em campos nomeados pelo mesmo
        # mecanismo de coordenadas; não exportamos linhas `raw` no JSON final.
        foods.append(item)

    grouped: dict[str, list[dict]] = {}
    for item in foods:
        category = tables["table_1"].get(str(item["food_number"]), {}).get("category", "uncategorized")
        item.pop("table_1", None)
        item.pop("table_2", None)
        item.pop("table_3", None)
        item.pop("category", None)
        grouped.setdefault(category, []).append(item)

    stats = {
        "food_records": len(foods),
        "table_1_records": len(table1_structured),
        "table_2_records": len(tables["table_2"]),
        "table_3_records": len(tables["table_3"]),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(grouped, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False))
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
