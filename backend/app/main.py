from app.api.routes.customers import router as customers_router
from fastapi import FastAPI

app = FastAPI(
    title="Brightloop Subscription Management API",
    description="Backend API for Subscription Management System",
    version="1.0.0",
)
app.include_router(customers_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Brightloop Subscription Management System API",
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "backend",
    }
