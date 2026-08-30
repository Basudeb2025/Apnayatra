from pathlib import Path
from langchain_core.messages import SystemMessage, HumanMessage
from groq import Groq
import os
from mem0 import MemoryClient
from dotenv import load_dotenv
from prompt.s_prompt import Assistant_system_prompt

load_dotenv()

# 1. Read the Markdown file
connected_url = os.getenv("mem0_api")
_GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "openai/gpt-oss-20b")
_GROQ_API_KEY = os.getenv("GROQ_API_KEY")

system_prompt_content = Assistant_system_prompt

client = MemoryClient(api_key=connected_url)

def Admin_assistant_agent(query,thredId):

    search_result = client.search(query, filters={"user_id": thredId})
    top_match = search_result["results"][0]["memory"] if search_result.get("results") else "The memory not found"
    llm = Groq(api_key=_GROQ_API_KEY)
    system_p = system_prompt_content + top_match
    response = llm.chat.completions.create(
        model= _GROQ_MODEL_NAME,
        messages=[
            {
                "role":"system",
                "content": system_p
            },
            {
                "role":"user",
                "content":query
            }
        ]
    )
    # 3. Create message payload
    message = [
    {
        "role": "user",
        "content": query
    },
    {
        "role": "assistant",
        "content": response.choices[0].message.content
    }
    ]
    client.add(message, user_id=thredId)
    return response.choices[0].message.content

