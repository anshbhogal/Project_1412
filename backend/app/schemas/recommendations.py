
from pydantic import BaseModel
from typing import List


class RecommendationResponse(BaseModel):
    category: str
    suggestions: List[str]
