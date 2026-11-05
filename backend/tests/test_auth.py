"""Real API/authentication flows against isolated SQLite, never the configured DB."""
import os
from datetime import datetime, timedelta, timezone

os.environ.setdefault('JWT_SECRET_KEY', 'isolated-test-secret-at-least-32-characters')

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.user import Base, User
from app.routers import auth
from app.core import dependencies, security


@pytest.fixture
def client(monkeypatch):
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(auth, 'engine', engine)
    monkeypatch.setattr(dependencies, 'engine', engine)
    with TestClient(app) as client:
        yield client, engine
    engine.dispose()


@pytest.mark.parametrize('role,other', [('buyer', 'seller'), ('seller', 'buyer')])
def test_account_lifecycle(client, role, other):
    api, engine = client
    details = {'name': 'Kamal Perera', 'email': f'{role}@example.com', 'password': 'TestPassword123!', 'role': role}
    response = api.post('/auth/register', json=details)
    assert response.status_code == 201
    assert response.json()['user']['role'] == role
    with Session(engine) as session:
        stored = session.scalar(select(User))
        assert stored.role == role
        assert stored.hashed_password != details['password']
        assert security.verify_password(details['password'], stored.hashed_password)
    assert api.post('/auth/register', json=details).status_code == 409
    assert api.post('/auth/login', json={**details, 'password': 'wrong'}).status_code == 401
    login = api.post('/auth/login', json=details)
    assert login.status_code == 200
    headers = {'Authorization': f"Bearer {login.json()['access_token']}"}
    assert api.get('/auth/me', headers=headers).json() == response.json()['user']
    dashboard = api.get(f'/{role}/dashboard', headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()['user']['role'] == role
    assert api.get(f'/{other}/dashboard', headers=headers).status_code == 403
    assert api.get('/auth/me', headers=headers).status_code == 200


def test_invalid_sessions_validation_and_cors(client):
    api, _ = client
    expired = jwt.encode({'sub': '1', 'exp': datetime.now(timezone.utc) - timedelta(minutes=1)}, security.JWT_SECRET_KEY, algorithm='HS256')
    for token in [None, 'invalid', expired]:
        headers = {'Authorization': f'Bearer {token}'} if token else {}
        assert api.get('/auth/me', headers=headers).status_code == 401
    assert api.post('/auth/register', json={'name': 'Test', 'email': 'invalid', 'password': 'short', 'role': 'admin'}).status_code == 422
    for origin in ['http://localhost:5173', 'http://127.0.0.1:5173']:
        response = api.options('/auth/login', headers={'Origin': origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,authorization'})
        assert response.status_code == 200
        assert response.headers['access-control-allow-origin'] == origin
