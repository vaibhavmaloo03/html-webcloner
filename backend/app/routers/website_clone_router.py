from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.website_clone_service import WebsiteCloneService

router = APIRouter()
website_clone_service = WebsiteCloneService()

class WebsiteCloneRequest(BaseModel):
    url: str

@router.post("/clone")
async def clone_website(request: WebsiteCloneRequest):
    try:
        result = await website_clone_service.clone_website(request.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 