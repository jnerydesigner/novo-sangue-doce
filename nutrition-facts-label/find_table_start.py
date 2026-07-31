import pdfplumber

PDF_PATH = "table.pdf"
SEARCH_TEXT = "Composição de alimentos por 100 gramas"


def find_table_start() -> None:
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total de páginas no PDF: {len(pdf.pages)}")

        for pdf_page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""

            if SEARCH_TEXT.casefold() in text.casefold():
                print(
                    f"Título encontrado na página real do PDF: "
                    f"{pdf_page_number}"
                )

                print("-" * 80)
                print(text[:1500])
                print("-" * 80)


if __name__ == "__main__":
    find_table_start()
