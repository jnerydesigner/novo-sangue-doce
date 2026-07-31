import pdfplumber


def inspect_pdf(pdf_path: str) -> None:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Quantidade de páginas: {len(pdf.pages)}")

        for page_number, page in enumerate(pdf.pages[:5], start=1):
            text = page.extract_text() or ""

            print("=" * 80)
            print(f"PÁGINA {page_number}")
            print(text[:1000])


if __name__ == "__main__":
    inspect_pdf("table.pdf")
