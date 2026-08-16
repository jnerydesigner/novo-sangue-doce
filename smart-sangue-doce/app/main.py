from fastapi import FastAPI

from app.routers import health, measurement_images


def create_app() -> FastAPI:
    app = FastAPI(
        title="Smart Sangue Doce",
        version="0.1.0",
        description="Centraliza servicos de inteligencia do Sangue Doce.",
    )
    app.include_router(health.router)
    app.include_router(measurement_images.router, prefix="/v1")
    return app


app = create_app()
