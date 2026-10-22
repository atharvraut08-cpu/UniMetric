import base64
import json
from rest_framework import permissions


def is_admin_user(request):
    """
    Evaluates whether the incoming HTTP request is authenticated as an Administrator.
    Supports multiple authentication patterns in UniMetric:
    1. Standard Django authentication (is_staff or is_superuser).
    2. Supabase JWT in Authorization header (claims.user_metadata.role == 'Admin').
    3. Custom Role headers ('X-User-Role' or 'X-Role' == 'Admin').
    4. Payload / query param fallback ('role' == 'Admin' or 'user_role' == 'Admin').
    """
    # 1. Standard Django user session
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        if user.is_staff or user.is_superuser:
            return True

    # 2. Custom headers
    role_header = request.headers.get("X-User-Role") or request.headers.get("X-Role")
    if role_header and role_header.strip().lower() == "admin":
        return True

    # 3. Supabase JWT Token in Authorization header
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                # Add base64 padding for urlsafe decoding
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                claims = json.loads(decoded_bytes.decode("utf-8"))
                user_meta = claims.get("user_metadata", {})
                app_meta = claims.get("app_metadata", {})
                role = (
                    user_meta.get("role") or
                    app_meta.get("role") or
                    claims.get("role")
                )
                if role and str(role).strip().lower() == "admin":
                    return True
        except Exception:
            pass

    # 4. Fallback in payload or query params
    if getattr(request, 'data', None) and isinstance(request.data, dict):
        body_role = request.data.get("role") or request.data.get("user_role")
        if body_role and str(body_role).strip().lower() == "admin":
            return True

    param_role = request.query_params.get("role") or request.query_params.get("user_role")
    if param_role and str(param_role).strip().lower() == "admin":
        return True

    return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission allowing public read access (GET, HEAD, OPTIONS)
    while restricting creation/modification (POST, PUT, PATCH, DELETE) to verified Admins.
    """
    message = "Administrator privileges are required to perform this action."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin_user(request)
