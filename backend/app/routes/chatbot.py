from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os

router = APIRouter()

# Define the path to the tax_faq.json file
# Adjust the path as necessary based on your project structure
TAX_FAQ_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "tax_faq.json")

class ChatbotQuery(BaseModel):
    question: str

class ChatbotResponse(BaseModel):
    answer: str

@router.post("/query", response_model=ChatbotResponse)
async def query_chatbot(query: ChatbotQuery):
    try:
        with open(TAX_FAQ_FILE, "r") as f:
            tax_faq_data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Tax FAQ data file not found.")

    user_question = query.question.lower()

    for item in tax_faq_data:
        if item["term"].lower() in user_question:
            return {"answer": item["description"]}
    
    # Log unanswered questions for future improvements (placeholder)
    # with open("chatbot_unanswered.log", "a") as log_file:
    #     log_file.write(user_question + "\n")

    return {"answer": "Sorry, I don’t know this term yet."
}
