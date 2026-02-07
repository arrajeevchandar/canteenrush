from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, orders, menu, prediction

app = FastAPI(title="Canteen Rush AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(menu.router, prefix="/api/menu", tags=["Menu"])
app.include_router(prediction.router, prefix="/api/predict", tags=["Prediction"])

@app.on_event("startup")
def startup_event():
    from app.core import database
    from app.models import models
    models.Base.metadata.create_all(bind=database.engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to Canteen Rush AI API"}
