from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_json_response(self, system_prompt: str, user_message: str) -> Dict[str, Any]:
        """All LLM providers must return a strict JSON dictionary."""
        pass