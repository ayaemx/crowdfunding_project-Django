# crowdfunding_projectt/ai_service.py - NEW FILE
import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class HuggingFaceChatbot:
    """Free AI chatbot using Hugging Face Inference API"""

    def __init__(self):
        # Using free Hugging Face inference API (no API key needed for basic usage)
        self.api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"

    def get_campaign_advice(self, user_query, project_context=None):
        """Generate campaign advice based on user query"""
        try:
            # Create context-aware prompt
            context = ""
            if project_context:
                context = f"Project: {project_context.get('title', '')}\nCategory: {project_context.get('category', '')}\nTarget: ${project_context.get('target', 0)}\n\n"

            prompt = f"""
{context}User question: {user_query}

As a crowdfunding expert, provide helpful advice about:
- Campaign optimization strategies
- Donation tips and best practices
- Platform features and usage
- Success factors for crowdfunding

Keep response helpful, encouraging, and under 150 words.
"""

            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_length": 150,
                    "temperature": 0.7,
                    "do_sample": True
                }
            }

            response = requests.post(
                self.api_url,
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    generated_text = result[0].get('generated_text', '')
                    # Clean up the response
                    if generated_text:
                        clean_response = generated_text.replace(prompt, '').strip()
