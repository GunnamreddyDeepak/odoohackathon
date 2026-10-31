from app.api.routes.customers import router as customers_router
from fastapi import FastAPI
from app.api.routes.products import router as products_router
from app.api.routes.product_variants import router as product_variants_router
app = FastAPI(
    title="Brightloop Subscription Management API",
    description="Backend API for Subscription Management System",
    version="1.0.0",
)
app.include_router(product_variants_router, prefix="/api/v1")
app.include_router(customers_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
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
