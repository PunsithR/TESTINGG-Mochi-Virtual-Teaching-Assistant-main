"""
Seed script — run once to populate initial categories and questions.
Usage: python seed.py
"""

from revisionGamesBackend.revision_config import get_connection, init_db


def seed():
    init_db()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Skip if data exists
            cur.execute("SELECT COUNT(*) FROM categories")
            if cur.fetchone()[0] > 0:
                print("Database already seeded.")
                return

            categories_data = [
                ("Fruits", "Learn fruits using games", "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop", "bg-red-100"),
                ("Numbers", "Count and learn numbers", "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop", "bg-blue-100"),
                ("Shapes", "Identify different shapes", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "bg-purple-100"),
                ("Animals", "Meet friendly animals", "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop", "bg-green-100"),
                ("Colours", "Explore rainbow colours", "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=400&h=300&fit=crop", "bg-yellow-100"),
                ("Vegetables", "Healthy veggies fun", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", "bg-orange-100"),
            ]

            cat_ids = []
            for name, desc, icon, color in categories_data:
                cur.execute(
                    """INSERT INTO categories (name, description, icon_url, color)
                       VALUES (%s, %s, %s, %s) RETURNING id""",
                    (name, desc, icon, color),
                )
                cat_ids.append(cur.fetchone()[0])

            # Fruits questions (category index 0)
            fruits_id = cat_ids[0]
            fruits_questions = [
                ("Apple", "Apple", [
                    ("Apple", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop"),
                    ("Banana", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop"),
                    ("Grapes", "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&h=300&fit=crop"),
                ]),
                ("Banana", "Banana", [
                    ("Orange", "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop"),
                    ("Banana", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop"),
                    ("Strawberry", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop"),
                ]),
            ]

            for target, correct, options in fruits_questions:
                cur.execute(
                    """INSERT INTO questions (category_id, target_item, correct_answer)
                       VALUES (%s, %s, %s) RETURNING id""",
                    (fruits_id, target, correct),
                )
                q_id = cur.fetchone()[0]
                for label, img_url in options:
                    cur.execute(
                        """INSERT INTO question_options (question_id, label, image_url)
                           VALUES (%s, %s, %s)""",
                        (q_id, label, img_url),
                    )

        conn.commit()
        print("✅ Database seeded successfully!")
    finally:
        conn.close()


if __name__ == "__main__":
    seed()
