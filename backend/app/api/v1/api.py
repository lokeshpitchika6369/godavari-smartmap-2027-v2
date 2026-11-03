from fastapi import APIRouter
from app.api.v1.endpoints import health, crowd, emergency, missing_persons, admin, sync

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(crowd.router)
api_router.include_router(emergency.router)
api_router.include_router(missing_persons.router)
api_router.include_router(admin.router)
api_router.include_router(sync.router, prefix="/incidents")

