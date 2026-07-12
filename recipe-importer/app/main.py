import httpx
from fastapi import FastAPI, HTTPException

from app.schemas.recipe import ImportRecipeRequest, ImportRecipeResponse
from app.services.robots_checker import RobotsDeniedError
from app.workers.recipe_import_worker import RecipeImportWorker, UnsafeUrlError

app = FastAPI(title="Sangue Doce Recipe Importer", version="1.0.0")
worker = RecipeImportWorker()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/recipes/import", response_model=ImportRecipeResponse)
def import_recipe(payload: ImportRecipeRequest) -> ImportRecipeResponse:
    try:
        return worker.import_url(str(payload.url))
    except (UnsafeUrlError, RobotsDeniedError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=502, detail=f"O site de origem respondeu HTTP {error.response.status_code}.") from error
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail="Não foi possível acessar o site de origem.") from error


@app.on_event("shutdown")
def shutdown() -> None:
    worker.close()
