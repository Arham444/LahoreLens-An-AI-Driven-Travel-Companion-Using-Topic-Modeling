from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import time

# ====== CONFIGURATION ======
API_KEY = "YoutubeAPIKey"

# 2. PASTE THE VIDEO ID HERE (e.g., "rJXhbhtmHjE")
VIDEO_ID = ""

# 3. HOW MANY COMMENTS DO YOU WANT?
MAX_COMMENTS = 1000
# ===========================

# --- UPGRADE 1: EXPANDED KEYWORDS LIST ---
# This list now includes specific places and review concepts
LAHORE_ENTITIES = [
    # Generic Locations
    "lahore",
    "old city",
    "androon",
    "dha",
    "gulberg",
    "johar town",
    "wapda town",
    "model towncantt",
    "garden town",
    "satellite town",
    "township",
    "shahdara",
    "faisal town",
    "samanabad",
    "iqbal town",
    "lcci",
    "mall road",
    "liberty market",
    "anarkali",
    "food street",
    "fort road",
    "data darbar",
    "mm alam",
    "gulshan-e-iqbal",
    "gulberg iii",
    "pakistan railways",
    # Famous Landmarks
    "liberty",
    "badshahi mosque",
    "shahi masjid",
    "data darbar",
    "hazrat ali",
    "minar",
    "fort",
    "qila",
    "badshahi",
    "minar-e-pakistan",
    "museum",
    "zoo",
    "wagah",
    "border",
    "shalimar",
    "bagh",
    "park",
    "joyland",
    # Generic Food Words
    "food",
    "khana",
    "meal",
    "breakfast",
    "lunch",
    "dinner",
    "nashta",
    "street food",
    "desi",
    "karahi",
    "biryani",
    "pulao",
    "tikka",
    "kebab",
    "nihari",
    "paye",
    "chanay",
    "halwa puri",
    "gol gappay",
    "chaat",
    "samosa",
    "pakora",
    "burger",
    "fries",
    "pizza",
    "shawarma",
    "roll",
    "paratha",
    "lassi",
    "chai",
    "tea",
    "coffee",
    "fish",
    "restaurant",
    "cafe",
    "dhaba",
    "hotel",
    "stall",
    # Famous Lahore Brand Names (Crucial for NER)
    "monal",
    "haveli",
    "poet",
    "junoon",
    "salt",
    "spice",
    "arcadian",
    "yum",
    "bamboo",
    "butt",
    "waris",
    "phajja",
    "mohammadi",
    "fiqay",
    "chaye khana",
    "gloria",
    "kfc",
    "mcdonald",
    "savour",
    "cheezious",
    # Review Attributes (Sentiment Indicators)
    "taste",
    "mazay",
    "swad",
    "yummy",
    "tasty",
    "delicious",
    "spicy",
    "fresh",
    "freshly",
    "hot",
    "cold",
    "flavor",
    "flavour",
    "portion",
    "quantity",
    "big",
    "small",
    "large",
    "helping",
    "quality",
    "freshness",
    "stale",
    "price",
    "bill",
    "expensive",
    "mehanga",
    "cheap",
    "sasta",
    "rate",
    "money",
    "ambiance",
    "mahaul",
    "view",
    "environment",
    "seating",
    "family",
    "crowd",
    "rush",
    "service",
    "staff",
    "waiter",
    "cleaning",
    "hygiene",
    "safai",
]

#  SPAM FILTER ---
SPAM_KEYWORDS = [
    "subscribe",
    "sub4sub",
    "channel",
    "my video",
    "check out",
    "http",
    "www",
    ".com",
    "follow me",
    "100%",
    "free",
    "promo",
    "gift",
    "click",
    "link",
    "whatsapp",
]


def clean_text(text):
    """Simple cleaner to handle capitalization and spacing"""
    return str(text).lower().strip()


def is_junk(text):
    """Returns True if the comment is spam or useless"""
    cleaned = clean_text(text)

    # 1. Length Check: If it's less than 3 words, it's usually useless (e.g., "Nice", "Good one")
    # Exception: "Best food ever" is 3 words, so we keep >= 3.
    if len(cleaned.split()) < 3:
        return True

    # 2. Spam Check: If it contains spam words
    if any(spam in cleaned for spam in SPAM_KEYWORDS):
        return True

    return False


def is_relevant(text):
    """Returns True if the comment is about Lahore/Food/Travel"""
    cleaned = clean_text(text)

    # Check if ANY of our keyword entities exist in the comment
    return any(entity in cleaned for entity in LAHORE_ENTITIES)


def get_video_comments(youtube, video_id, max_comments=100):
    comments_all = []
    comments_relevant = []
    next_page_token = None

    print(f"--- STARTING EXTRACTION FOR VIDEO: {video_id} ---")

    try:
        while len(comments_all) < max_comments:
            request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=100,  # API Limit per page
                pageToken=next_page_token,
                textFormat="plainText",
            )

            response = request.execute()
            items = response.get("items", [])

            if not items:
                print("No more comments found.")
                break

            for item in items:
                # Extract the comment text
                c_obj = item["snippet"]["topLevelComment"]["snippet"]
                text = c_obj["textDisplay"]
                author = c_obj["authorDisplayName"]
                likes = c_obj["likeCount"]
                date = c_obj["publishedAt"]

                # 1. First, check if it's junk/spam
                if is_junk(text):
                    continue  # Skip this loop iteration, don't save it

                # 2. Save to "All Cleaned" list (Non-spam comments)
                comment_data = {
                    "author": author,
                    "comment": text,
                    "likes": likes,
                    "published_at": date,
                    "is_relevant": False,  # Default to False
                }

                # 3. Check Relevance (Is it about Lahore?)
                if is_relevant(text):
                    comment_data["is_relevant"] = True
                    comments_relevant.append(comment_data)

                comments_all.append(comment_data)

            # Progress Update
            print(
                f"Processed batch. Total Cleaned: {len(comments_all)} | Relevant (Lahore): {len(comments_relevant)}"
            )

            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

            # Sleep briefly to be nice to the API
            time.sleep(0.5)

    except HttpError as e:
        print(f"An API error occurred: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

    return comments_all, comments_relevant


def main():
    if API_KEY == "YOUR_NEW_API_KEY_HERE":
        print("ERROR: You forgot to paste your API Key in line 8!")
        return

    print("Building YouTube client...")
    youtube = build("youtube", "v3", developerKey=API_KEY)

    # Fetch Data
    all_data, relevant_data = get_video_comments(youtube, VIDEO_ID, MAX_COMMENTS)

    # Save to CSV
    if all_data:
        # Save the dataset specifically for your Model Training (Relevant only)
        df_model = pd.DataFrame(relevant_data)
        filename = f"dataset_lahore_comments_{VIDEO_ID}.csv"
        df_model.to_csv(filename, index=False, encoding="utf-8-sig")

        print("\n" + "=" * 40)
        print("SUCCESS! DATA SAVED.")
        print(f"File created: {filename}")
        print(f"Total Useful Comments Collected: {len(df_model)}")
        print("=" * 40)
        print("Next Step: Feed this CSV into your Sentiment Analysis script.")
    else:
        print("No comments were collected. Check the Video ID.")


if __name__ == "__main__":
    main()
