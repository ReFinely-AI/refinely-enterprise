import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.reconciliation import Anomaly
from app.services.llm.groq_provider import GroqProvider

# Instantiate our provider (Adapter Pattern)
llm_provider = GroqProvider()

async def get_copilot_response(db: AsyncSession, reconciliation_id: int, user_message: str) -> dict:
    # 1. Fetch only UNRESOLVED anomalies to save context window tokens
    stmt = select(Anomaly).where(
        Anomaly.reconciliation_id == reconciliation_id, 
        Anomaly.is_resolved == False
    )
    result = await db.execute(stmt)
    anomalies = result.scalars().all()

    # 2. Compress the data (Do not send massive DB objects, just the core facts)
    anomaly_data = [
        {
            "id": a.id,
            "type": a.anomaly_type,
            "title": a.title,
            "desc": a.description,
            "severity": a.severity
        } for a in anomalies
    ]

    # 3. Engineer the System Prompt
    system_prompt = f"""You are the ReFinely AI Financial Auditor Copilot.
Your job is to act as a Senior Accountant and help users resolve reconciliation anomalies.
Here are the current unresolved anomalies for this session:
{json.dumps(anomaly_data)}

CRITICAL RULES FOR YOUR JSON OUTPUT:
You MUST return a JSON object that matches this EXACT structure:
{{
  "message": "Your professional, concise Markdown response goes here. Combine all feedback into this single string.",
  "suggested_action": null
}}

FORMATTING RULES FOR THE "message" FIELD (MANDATORY):
The "message" string MUST use proper Markdown syntax — never write plain unformatted sentences strung together.
- When listing multiple anomalies or items, use a numbered Markdown list, one item per line, like:
  1. **Possible Duplicate Ledger Entry** (Severity: Medium) — Matches entry #342 exactly: Amount 500.0 on 2026-03-15.
  2. **Timing Gap of 8 Days** (Severity: Medium) — Bank: 2026-03-20 | Ledger: 2026-03-12.
- Always bold the anomaly title or key label using **double asterisks**.
- Put each anomaly/point on its own line — never merge multiple items into one paragraph.
- Use a blank line between the intro sentence and the list.
- If you reference specific numbers (amounts, dates, scores), keep them inline but bolded labels like **Amount:**, **Severity:**, **Score:** where relevant.
- For a short summary with no list items, plain sentences are fine — only use lists when there are 2 or more distinct points/anomalies/items to present.
- Never output one giant run-on paragraph when multiple anomalies are being described — always break them into a list.

EXAMPLE of CORRECT "message" formatting:
"I found 4 unresolved anomalies in this reconciliation:\\n\\n1. **Possible Duplicate Ledger Entry** (Severity: Medium) — Matches entry #342 exactly: Amount 500.0 on 2026-03-15.\\n2. **Timing Gap of 8 Days** (Severity: Medium) — Bank: 2026-03-20 | Ledger: 2026-03-12.\\n3. **Unmatched High-Value Transaction** (Severity: High) — A large bank movement of -8500.0 is missing from the ledger.\\n4. **Statistical Anomaly Detected** (Severity: Medium) — Transaction of 1200.0 on day 20 deviates from historical patterns (Score: -0.01).\\n\\nWould you like me to suggest a resolution for any of these?"

RULES FOR VALUES:
1. "message": MUST be a single string. Do NOT create nested objects or arrays here. Use \\n for line breaks within the string as shown in the example.
2. "suggested_action": 
   - Return null if the user is asking for a general summary or feedback on MULTIPLE anomalies.
   - ONLY return a JSON object (e.g., {{"action": "create_journal_entry", "amount": 8500, "anomaly_id": 3}}) if the user is asking how to fix ONE SPECIFIC anomaly.
"""

    # 4. Ask the LLM
    response_data = await llm_provider.generate_json_response(system_prompt, user_message)
    
    # 5. THE GUARDRAIL: Catch LLM Hallucinations to prevent 500 Server Errors
    if "message" not in response_data:
        # If the LLM went rogue and changed the keys, we force it back into the schema
        return {
            "message": f"I processed your request, but formatted it unconventionally. Here is the raw data:\n\n```json\n{json.dumps(response_data, indent=2)}\n```",
            "suggested_action": None
        }
    
    # Ensure suggested_action exists in the dictionary to satisfy Pydantic
    if "suggested_action" not in response_data:
        response_data["suggested_action"] = None

    return response_data