from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import website_clone

app = FastAPI(title="Website Cloning API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(website_clone.router, prefix="/api/v1", tags=["website-clone"])

@app.get("/")
async def root():
    return {"message": "Website Cloning API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
