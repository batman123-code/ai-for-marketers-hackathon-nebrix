"""
MemoryOS AI - Main Application

FastAPI backend entry point for the AI Chief Marketing Officer SaaS platform.

This module:
- Initializes the FastAPI application
- Registers all route modules
- Configures CORS middleware
- Sets up structured logging
- Provides global error handlers
- Exposes a health check endpoint

Run with:
    uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import get_settings
from backend.utils.validators import HealthResponse

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("memoryos")

# ---------------------------------------------------------------------------
# Application Lifespan
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown events."""
    settings = get_settings()
    logger.info("Starting %s v%s (%s)", settings.APP_NAME, settings.APP_VERSION, settings.APP_ENV)

    # Initialize fallback SQLite database if Supabase is not set up
    from database.db_service import db_service
    
    if not settings.supabase_configured:
        logger.warning("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env")

    yield

    logger.info("Shutting down %s", settings.APP_NAME)


# ---------------------------------------------------------------------------
# FastAPI App Initialization
# ---------------------------------------------------------------------------

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Chief Marketing Officer - Analyzes marketing data and provides strategic insights.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register Route Modules
# ---------------------------------------------------------------------------

from backend.routes.auth import router as auth_router
from backend.routes.upload import router as upload_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.chat import router as chat_router
from backend.routes.analytics import router as analytics_router
from backend.routes.reports import router as reports_router
from backend.routes.customers import router as customers_router

API_PREFIX = settings.API_PREFIX

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(upload_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(chat_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)
app.include_router(customers_router, prefix=API_PREFIX)

# ---------------------------------------------------------------------------
# Health Endpoint
# ---------------------------------------------------------------------------


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns application version, environment, and status.
    Used by load balancers and monitoring to verify the service is running.
    """
    return HealthResponse(
        success=True,
        message=f"{settings.APP_NAME} is running",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )


@app.get("/", tags=["System"])
async def root() -> dict:
    """Root endpoint - basic service info."""
    return {
        "success": True,
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "disabled",
    }


# ---------------------------------------------------------------------------
# Global Error Handlers
# ---------------------------------------------------------------------------


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle 404 Not Found errors."""
    logger.warning("404 Not Found: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "message": "The requested resource was not found",
            "error": "Not Found",
        },
    )


@app.exception_handler(422)
async def validation_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle 422 Validation Error responses."""
    logger.warning("422 Validation Error: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error in request data",
            "error": str(exc),
        },
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle 500 Internal Server Error responses."""
    logger.error("500 Internal Error: %s %s - %s", request.method, request.url.path, str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred",
            "error": "Internal Server Error",
        },
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for unhandled exceptions."""
    logger.error("Unhandled Exception: %s %s - %s", request.method, request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred",
            "error": str(exc) if settings.DEBUG else "Internal Server Error",
        },
    )
