from typing import Any


def merge_food_halves(
    left_rows: list[dict[str, Any]],
    right_rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    left_by_code = {
        str(row["external_code"]): row
        for row in left_rows
        if row.get("external_code")
    }

    right_by_code = {
        str(row["external_code"]): row
        for row in right_rows
        if row.get("external_code")
    }

    all_codes = sorted(
        set(left_by_code) | set(right_by_code),
        key=int,
    )

    merged: list[dict[str, Any]] = []
    review: list[dict[str, Any]] = []

    for code in all_codes:
        left = left_by_code.get(code)
        right = right_by_code.get(code)

        if left is None or right is None:
            review.append(
                {
                    "external_code": code,
                    "reason": "MISSING_HALF",
                    "left_found": left is not None,
                    "right_found": right is not None,
                }
            )
            continue

        merged.append(
            {
                **left,
                **right,
                "external_code": code,
            }
        )

    return merged, review
