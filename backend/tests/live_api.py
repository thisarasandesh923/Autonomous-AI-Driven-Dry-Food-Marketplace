"""Disposable temporary API for browser integration tests; no PostgreSQL writes."""
import atexit
import os
import secrets
from pathlib import Path
from tempfile import TemporaryDirectory

os.environ.setdefault('JWT_SECRET_KEY', secrets.token_urlsafe(48))

from sqlalchemy import create_engine
from app.models.user import Base
from app.routers import auth, buyer, products, seller
from app.core import dependencies
from app.main import app

temporary = TemporaryDirectory(prefix='dryleaf-integration-')
engine = create_engine(f'sqlite:///{Path(temporary.name) / "users.sqlite"}', connect_args={'check_same_thread': False})
atexit.register(engine.dispose)
Base.metadata.create_all(engine)
auth.engine = engine
buyer.engine = engine
products.engine = engine
seller.engine = engine
dependencies.engine = engine
