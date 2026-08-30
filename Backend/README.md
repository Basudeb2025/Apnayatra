# Hotel Agent — full stack

backend/   FastAPI + LangGraph + Groq + gemini+ mcp tools + mem0    (POST /session/start, /chat, /chat/confirm)

## Run

1. Backend
       cd backend
       pip install -r requirements.txt
       uvicorn api:app --reload
   Runs on http://localhost:8000


Groq use for normal task - like answer for the normal questions. If tools is required for anything then it will pass the message to the gemini.