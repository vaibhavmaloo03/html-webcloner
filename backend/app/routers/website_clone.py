from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from app.services.website_clone_service import WebsiteCloneService

router = APIRouter()
website_clone_service = WebsiteCloneService()

class CloneRequest(BaseModel):
    url: HttpUrl

class CloneResponse(BaseModel):
    html: str
    message: str

@router.post("/clone", response_model=CloneResponse)
async def clone_website(request: CloneRequest):
    try:
        result = await website_clone_service.clone_website(str(request.url))
        return CloneResponse(
            html=result["html"],
            message="Website cloned successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 