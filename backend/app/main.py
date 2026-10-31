
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.users import router as users_router
from app.api.routes.roles import router as roles_router
from app.api.routes.auth import router as auth_router
from app.api.routes.customers import router as customers_router
from app.api.routes.products import router as products_router
from app.api.routes.product_variants import router as product_variants_router
from app.api.routes.subscription_plans import router as subscription_plans_router
from app.api.routes.subscriptions import router as subscriptions_router
from app.api.routes.subscription_lines import router as subscription_lines_router
from app.api.routes.invoices import router as invoices_router
from app.api.routes.payments import router as payments_router
from app.api.routes.billing import router as recurring_billing_router

app = FastAPI(
    title="Brightloop Subscription Management API",
    description="Backend API for Subscription Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(customers_router, prefix=API_PREFIX)
app.include_router(products_router, prefix=API_PREFIX)
app.include_router(product_variants_router, prefix=API_PREFIX)
app.include_router(subscription_plans_router, prefix=API_PREFIX)
app.include_router(subscriptions_router, prefix=API_PREFIX)
app.include_router(subscription_lines_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(roles_router, prefix=API_PREFIX)
app.include_router(invoices_router, prefix=API_PREFIX)
app.include_router(payments_router, prefix=API_PREFIX)
app.include_router(recurring_billing_router, prefix=API_PREFIX)

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
