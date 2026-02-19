"""
Gemini AI Service + Native Gemini 3 Image Generation
========================================
Project MOCHI: A preschool educational assistant.
Handles text generation via Gemini 2.0 Flash and 
image generation via Gemini 3 Pro Image Preview.
"""

from google.genai import Client, types
import json
import logging
import uuid
import base64
from config import Config

# Initialize Logging
logger = logging.getLogger(__name__)

# Initialize Gemini Client
client = Client(api_key=Config.GEMINI_API_KEY)

# ──────────────────────────────────────
# SAFETY & CONTENT CONTROL
# ──────────────────────────────────────

SAFETY_BLOCKLIST = [
    'gun', 'weapon', 'knife', 'sword', 'blood', 'gore', 'violence', 
    'kill', 'death', 'war', 'bomb', 'scary', 'fight', 'monster', '18+'
]

def is_safe(query: str) -> bool:
    """Verifies that the prompt is appropriate for kids aged 2-6."""
    normalized = query.lower().strip()
    return not any(word in normalized for word in SAFETY_BLOCKLIST)

# ──────────────────────────────────────
# IMAGE GENERATION (GEMINI 3 PRO)
# ──────────────────────────────────────

def generate_ai_image(prompt_text: str) -> str:
    """
    Generates a custom image using Nano Banana Pro (Gemini 3 Pro Image).
    Returns a Base64 data URI string.
    """
    if not Config.GEMINI_API_KEY:
        logger.error("❌ GEMINI_API_KEY is missing!")
        return None

    try:
        config = types.GenerateContentConfig(
            system_instruction="You are Mochi, a professional AI photography assistant for kids. Generate high-fidelity, clean, and joyful images on plain backgrounds.",
            safety_settings=[
                types.SafetySetting(category='HARM_CATEGORY_DANGEROUS_CONTENT', threshold='BLOCK_LOW_AND_ABOVE'),
            ],
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(aspect_ratio="1:1"),
            temperature=0.4 
        )

        # Force specific cleanliness based on the prompt
        final_prompt = f"A clean, simple, photorealistic photo for a kids educational game showing: {prompt_text}. Easy to see and count."

        response = client.models.generate_content(
            model='gemini-3-pro-image-preview',
            contents=final_prompt,
            config=config
        )

        if not response.candidates or response.candidates[0].finish_reason == "SAFETY":
            logger.warning("🛡️ Gemini API Safety Block triggered.")
            return None

        for part in response.candidates[0].content.parts:
            # Skip the 'Thinking' process of the model
            if hasattr(part, 'thought') and part.thought:
                continue
            if part.inline_data:
                base64_data = base64.b64encode(part.inline_data.data).decode('utf-8')
                return f"data:image/png;base64,{base64_data}"

        return None

    except Exception as e:
        logger.error(f"📸 Image Generation Error: {e}")
        return None

# ──────────────────────────────────────
# QUESTION GENERATION
# ──────────────────────────────────────

def generate_questions(game_topic: str, subject: str, description: str) -> list:
    """
    Main entry point: Generates text with Flash and generates custom photos with Pro Image.
    """
    if not Config.GEMINI_API_KEY:
        logger.error("❌ GEMINI_API_KEY is missing!")
        return []

    # 1. Preschool Safety Guard
    if not is_safe(game_topic) or not is_safe(description):
        logger.warning("🛡️ Safety trigger! Defaulting to Puppies.")
        game_topic = "Happy Puppies"
        description = "Learn about friendly puppies playing in a garden."

    try:
        # 2. Generate the Lesson Plan (Text)
        prompt = f"""
        Act as Mochi, a preschool teacher. Create a fun, multiple-choice educational game.
        
        Here is your core data:
        - Game Theme: {game_topic}
        - Learning Skill: {subject}
        - Exact Scenario to Test: {description}
        
        CRITICAL RULES TO LINK THE QUESTION AND ANSWER:
        1. First, decide what the CORRECT answer is based on the Exact Scenario.
        2. You MUST write the `questionText` so it explicitly asks for that exact correct answer. 
           Format it EXACTLY like this: "Can you find the picture with [INSERT CORRECT ANSWER HERE]?"
        3. Create 3 options. ONE option must perfectly match the correct answer. The other TWO must be plausible wrong answers (e.g., wrong numbers or wrong colors).
        4. The `correct_answer` field MUST exactly match the `label` of the correct option.
        5. NEVER mention backgrounds like "tables" or "rooms" in the text.
        
        Respond ONLY with a JSON array in this exact format. Do not include markdown blocks.
        [
          {{
            "gameTitle": "{game_topic}",
            "questionText": "Can you find the picture with exactly 2 red apples?",
            "options": [
              {{ "label": "2 red apples", "imageGenerationPrompt": "Exactly 2 bright red apples isolated on a plain white background" }},
              {{ "label": "1 red apple", "imageGenerationPrompt": "Exactly 1 bright red apple isolated on a plain white background" }},
              {{ "label": "3 red apples", "imageGenerationPrompt": "Exactly 3 bright red apples isolated on a plain white background" }}
            ],
            "correct_answer": "2 red apples",
            "explanation": "Great job! That picture has exactly 2 red apples."
          }}
        ]
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        
        # Clean JSON parsing
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        questions = json.loads(text)

        # 3. Enrich with AI Generated Photos
        for q in questions:
            q["id"] = str(uuid.uuid4())
            for opt in q['options']:
                search_term = opt.get('imageGenerationPrompt', opt['label'])
                
                logger.info(f"🎨 Mochi is generating a custom image for: '{search_term}'")
                generated_image = generate_ai_image(search_term)
                opt['image'] = generated_image

        return questions

    except Exception as e:
        logger.error(f"🧠 Gemini/Process Error: {e}")
        return []

# ──────────────────────────────────────
# FEEDBACK GENERATION
# ──────────────────────────────────────

def generate_feedback(user_answer: str, correct_answer: str, target_item: str) -> dict:
    """Generates encouraging, Mochi-themed feedback for the child."""
    try:
        prompt = f"Mochi says: Child picked '{user_answer}', correct was '{correct_answer}'. Topic: '{target_item}'. Give happy feedback (max 12 words) and encouragement in JSON: {{'message': 'string', 'encouragement': 'string'}}"
        
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        text = response.text.strip()
        if "```" in text: text = text.split("```")[1].split("```")[0].strip()
        if text.startswith("json"): text = text[4:].strip()
        
        return json.loads(text)
    except Exception as e:
        logger.error(f"🧠 Feedback Generation Error: {e}")
        return {"message": "Great try! 🌟", "encouragement": "Let's try one more!"}