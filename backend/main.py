from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import website_clone_router

app = FastAPI(
    title="Website Clone API",
    description="API for cloning websites using AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(website_clone_router.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Website Clone API",
        "endpoints": {
            "clone_website": "/api/v1/clone",
            "docs": "/docs"
        }
    } 