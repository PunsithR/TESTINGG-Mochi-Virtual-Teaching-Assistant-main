"""
Gemini AI Service
=================
Handles Text (Gemini 2.0 Flash) and Image (Imagen 3) generation.
Includes a Preschool Safety Blocklist.
"""

from google.genai import Client
from google.genai import types
import json
import base64
import logging
import uuid
from config import Config

logger = logging.getLogger(__name__)

# Initialize Client
client = Client(api_key=Config.GEMINI_API_KEY)

# ──────────────────────────────────────
# SAFETY & CONFIG
# ──────────────────────────────────────

SAFETY_BLOCKLIST = [
    'gun', 'weapon', 'knife', 'sword', 'blood', 'gore', 'violence', 
    'kill', 'death', 'war', 'bomb', 'scary', 'fight', 'monster', '18+'
]

def is_safe(query: str) -> bool:
    """Checks if the user prompt is preschool-appropriate."""
    normalized = query.lower().strip()
    return not any(word in normalized for word in SAFETY_BLOCKLIST)


# ──────────────────────────────────────
# IMAGE GENERATION (THE ARTIST)
# ──────────────────────────────────────

def generate_mochi_image(label: str) -> str:
    """
    Uses Imagen 3 to generate a simple, preschool-friendly illustration.
    Returns a Base64 string for the React frontend.
    """
    if not Config.GEMINI_API_KEY:
        return ""

    try:
        # Prompt tuned for 2-6 year olds: High contrast, simple shapes
        art_prompt = (
            f"A simple, bright, and joyful preschool illustration of {label}. "
            f"Clear shapes on a solid white background, 3D claymation style. "
            f"No text, no clutter, very easy for a toddler to count."
        )

        response = client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=art_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                person_generation="DONT_ALLOW"
            )
        )

        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            return base64.b64encode(image_bytes).decode('utf-8')
        
        return ""

    except Exception as e:
        logger.error(f"🎨 Mochi Painting Error: {e}")
        return ""


# ──────────────────────────────────────
# TEXT GENERATION (THE BRAIN)
# ──────────────────────────────────────

def generate_questions(game_topic: str, subject: str, description: str) -> list:
    """
    Generates text questions and then triggers image generation for options.
    """
    if not Config.GEMINI_API_KEY:
        return []

    # 1. Safety Intercept
    if not is_safe(game_topic):
        logger.warning(f"🛡️ Safety Block triggered for: {game_topic}")
        game_topic = "Happy Puppies"
        description = "Learn about cute and friendly puppy friends!"

    try:
        # 2. Generate the Questions (Text Only First)
        prompt = f"""Generate 3 preschool questions about "{game_topic}".
        Subject: {subject}. Context: {description}.
        Respond with a strict JSON array:
        [{{
            "gameTitle": "{game_topic}",
            "questionText": "simple question",
            "options": [{{ "label": "Option 1" }}, {{ "label": "Option 2" }}, {{ "label": "Option 3" }}]
        }}]
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=prompt
        )
        
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            
        questions = json.loads(text)

        # 3. Generate Images for every option
        for q in questions:
            q["id"] = str(uuid.uuid4()) # Unique ID for React
            for opt in q['options']:
                logger.info(f"🎨 Mochi is painting: {opt['label']}")
                b64_img = generate_mochi_image(opt['label'])
                if b64_img:
                    # Send as Data URI so React can display it instantly
                    opt['image'] = f"data:image/png;base64,{b64_img}"
                else:
                    opt['image'] = None

        return questions

    except Exception as e:
        logger.error(f"Gemini generation error: {e}")
        return []

def generate_feedback(user_answer: str, correct_answer: str, target_item: str) -> dict:
    """Generate child-friendly feedback text."""
    try:
        prompt = f"You are Mochi (AI for kids 3-6). Kid picked '{user_answer}' for '{target_item}'. Correct is '{correct_answer}'. JSON: {{'isCorrect': bool, 'message': 'max 15 words', 'encouragement': 'max 10 words'}}"
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        return {"isCorrect": False, "message": "Try again! 💪", "encouragement": "Keep going!"}