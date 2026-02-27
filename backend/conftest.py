"""
conftest.py — Session-scoped environment setup for pytest.

Sets APP_ENV=development before any test module is imported,
ensuring the fail-fast APP_SECRET_KEY validation in app.py
auto-generates an ephemeral key instead of raising RuntimeError.
Clears APP_SECRET_KEY to prevent any accidentally-set key from
interfering with test isolation.
"""

import os

# These are set at collection time – before any test module is imported –
# so the module-level validation in app.py sees the correct environment.
os.environ.setdefault("APP_ENV", "development")
os.environ.pop("APP_SECRET_KEY", None)
