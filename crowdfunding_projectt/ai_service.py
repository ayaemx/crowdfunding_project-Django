# crowdfunding_projectt/ai_service.py - FREE AI SERVICE
import requests
import json


class HuggingFaceChatbot:
    """Free AI chatbot using Hugging Face API"""

    def __init__(self):
        # Using free Hugging Face inference API
        self.api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        # No API key needed for basic usage

    def get_campaign_recommendation(self, user_query):
        """Generate campaign recommendations"""
        try:
            prompt = f"""
            User question: {user_query}

            As a crowdfunding platform assistant, provide helpful advice about:
            - How to create successful campaigns
            - Tips for donors
            - Platform features
            - General crowdfunding guidance

            Keep responses helpful and under 100 words.
            """

            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_length": 100,
                    "temperature": 0.7
                }
            }

            response = requests.post(self.api_url, json=payload, timeout=10)

            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get('generated_text', 'I can help you with crowdfunding questions!')

            # Fallback responses
            return self.get_fallback_response(user_query)

        except Exception as e:
            return self.get_fallback_response(user_query)

    def get_fallback_response(self, query):
        """Fallback responses when AI is unavailable"""
        query_lower = query.lower()

        if 'donate' in query_lower or 'donation' in query_lower:
            return "To donate, browse our campaigns and click 'Support Project'. Every contribution helps creators reach their goals!"

        elif 'create' in query_lower or 'campaign' in query_lower:
            return "To create a campaign: 1) Choose a clear title 2) Set realistic goals 3) Add compelling images 4) Write detailed descriptions. Good luck!"

        elif 'help' in query_lower or 'support' in query_lower:
            return "I'm here to help! You can browse campaigns, make donations, create your own projects, or contact our support team."

        else:
            return "Welcome to our crowdfunding platform! I can help you with donations, creating campaigns, or general questions. What would you like to know?"


# Global instance
chatbot = HuggingFaceChatbot()
