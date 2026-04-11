# backend/app/services/llm/groq_provider.py
import json
import os
from groq import AsyncGroq
from dotenv import load_dotenv
from app.services.llm.base import BaseLLMProvider
from typing import Dict, Any

class GroqProvider(BaseLLMProvider):
    def __init__(self):
        # Force Python to read the .env file
        load_dotenv() 
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is missing from the .env file!")
            
        self.client = AsyncGroq(api_key=api_key)
        
        # --- THE FIX: UPGRADED TO LLAMA 3.1 ---
        self.model = "llama-3.1-8b-instant" 

    async def generate_json_response(self, system_prompt: str, user_message: str) -> Dict[str, Any]:
        completion = await self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            model=self.model,
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        
        response_content = completion.choices[0].message.content
        return json.loads(response_content)