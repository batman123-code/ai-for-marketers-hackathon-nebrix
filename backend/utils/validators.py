"""
MemoryOS AI - Validators

Pydantic models and validation functions for request/response data.
"""

import re
from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Generic response models
# ---------------------------------------------------------------------------

class SuccessResponse(BaseModel):
    """Standard success response format."""
    success: bool = True
    message: str
    data: dict | list | None = None


class ErrorResponse(BaseModel):
    """Standard error response format."""
    success: bool = False
    message: str
    error: str | None = None


class HealthResponse(BaseModel):
    """Health check response."""
    success: bool = True
    message: str
    version: str
    environment: str


class PaginationParams(BaseModel):
    """Common pagination parameters."""
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


# ---------------------------------------------------------------------------
# Auth request models
# ---------------------------------------------------------------------------

class SignupRequest(BaseModel):
    """Request body for POST /auth/signup."""
    full_name: str = Field(
        ..., min_length=1, max_length=200,
        description="User's full name",
    )
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(
        ..., min_length=8, max_length=128,
        description="Password (minimum 8 characters)",
    )
    company_name: str = Field(
        ..., min_length=1, max_length=200,
        description="Name of the user's company",
    )
    industry: str = Field(
        default="", max_length=200,
        description="Industry the company operates in",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Ensure password meets basic strength requirements."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    """Request body for POST /auth/login."""
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")


class ResetPasswordRequest(BaseModel):
    """Request body for POST /auth/reset-password."""
    email: EmailStr = Field(..., description="Registered email address")


class SendOTPRequest(BaseModel):
    """Request body for POST /auth/send-otp."""
    email: EmailStr = Field(..., description="Email to send OTP to")


class VerifyOTPRequest(BaseModel):
    """Request body for POST /auth/verify-otp."""
    email: EmailStr = Field(..., description="Email the OTP was sent to")
    token: str = Field(..., min_length=4, max_length=10, description="OTP code")


# ---------------------------------------------------------------------------
# Auth response models
# ---------------------------------------------------------------------------

class AuthUserData(BaseModel):
    """User data returned in auth responses."""
    id: str | None = None
    email: str | None = None
    phone: str | None = None
    role: str | None = None
    user_metadata: dict | None = None
    created_at: str | None = None


class AuthSessionData(BaseModel):
    """Session data returned in auth responses."""
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str | None = None
    expires_at: int | None = None
    expires_in: int | None = None


class AuthResponse(BaseModel):
    """Standard authentication response."""
    success: bool = True
    message: str
    data: dict | None = None


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_email_format(email: str) -> bool:
    """Validate that a string is a properly formatted email address."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_csv_extension(filename: str) -> bool:
    """Check that a filename ends with .csv."""
    return filename.lower().endswith(".csv")


def validate_file_size(size_bytes: int, max_size_mb: int = 50) -> bool:
    """Check that file size is within allowed limit."""
    max_bytes = max_size_mb * 1024 * 1024
    return 0 < size_bytes <= max_bytes


class ProfileUpdateRequest(BaseModel):
    """Request body for POST /auth/profile."""
    full_name: str = Field(..., min_length=1, max_length=200)


class CompanyUpdateRequest(BaseModel):
    """Request body for POST /auth/company."""
    name: str = Field(..., min_length=1, max_length=200)
    industry: str = Field(default="", max_length=200)
    website: str = Field(default="", max_length=200)


class ReportGenerateRequest(BaseModel):
    """Request body for POST /reports/generate."""
    report_type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(default="", max_length=200)


class ChatMessageRequest(BaseModel):
    """Request body for POST /chat/message."""
    message: str = Field(..., min_length=1)



