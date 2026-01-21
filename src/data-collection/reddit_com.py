from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import os

# ================= CONFIGURATION =================

SUBREDDITS = ["Lahore", "Pakistan", "PakistaniFood"]

SEARCH_QUERIES = [
    "food", "restaurant", "travel",
    "visit", "tourist", "best place", "hidden gem"
]

TARGET_COMMENTS = 2000

# ================= FILTER KEYWORDS =================

LAHORE_ENTITIES = [
    "lahore", "dha", "gulberg", "johar town", "mm alam",
    "liberty", "fort", "badshahi", "food", "desi",
    "karahi", "biryani", "tikka", "nihari",
    "paye", "restaurant", "cafe",
    "monal", "haveli", "butt", "waris", "yum",
    "taste", "price", "cheap", "expensive",
    "ambiance", "view", "service"
]

# ================= UTILITY FUNCTIONS =================

def is_junk(text):
    text = str(text).lower()
    if len(text.split()) < 4:
        return True
    if "http" in text or "deleted" in text or "removed" in text:
        return True
    return False

def is_relevant(text):
    text = str(text).lower()
    return any(word in text for word in LAHORE_ENTITIES)

def load_seen_data():
    seen_threads = set()
    seen_comments = set()

    if os.path.exists("seen_threads.txt"):
        with open("seen_threads.txt", "r", encoding="utf-8") as f:
            seen_threads = set(line.strip() for line in f)

    if os.path.exists("existing_comments.txt"):
        with open("existing_comments.txt", "r", encoding="utf-8") as f:
            seen_comments = set(line.strip() for line in f)

    return seen_threads, seen_comments

# ================= SELENIUM SETUP =================

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    )
    # options.add_argument("--headless")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    return driver

# ================= FIND NEW THREADS =================

def get_thread_links(driver, seen_threads):
    links = []
    print("🔍 Searching Reddit for NEW threads...")

    for sub in SUBREDDITS:
        for query in SEARCH_QUERIES:
            url = f"https://old.reddit.com/r/{sub}/search?q={query}&restrict_sr=on&sort=new&t=all"
            driver.get(url)
            time.sleep(2)

            posts = driver.find_elements("css selector", "a.search-title")
            for post in posts:
                link = post.get_attribute("href")
                if link and link not in seen_threads:
                    links.append(link)

            print(f"   Found {len(links)} new threads so far")
            time.sleep(1)

    return links

# ================= SCRAPE COMMENTS =================

def scrape_comments_from_thread(driver, url, seen_comments):
    driver.get(url + "?limit=500")
    time.sleep(random.uniform(2, 4))

    soup = BeautifulSoup(driver.page_source, "html.parser")

    title_tag = soup.find("a", class_="title")
    post_title = title_tag.text if title_tag else "Unknown"

    data = []
    comments = soup.select("div.comment")

    for comment in comments:
        try:
            body = comment.select_one("div.usertext-body")
            if not body:
                continue

            text = body.get_text(separator=" ").strip()
            if text in seen_comments:
                continue

            user_tag = comment.select_one("a.author")
            user = user_tag.text if user_tag else "deleted"

            score_tag = comment.select_one("span.score")
            likes = score_tag.text if score_tag else "0"

            if is_junk(text) or not is_relevant(text):
                continue

            data.append({
                "Source": "Reddit",
                "Context_Title": post_title,
                "User": user,
                "Comment": text,
                "Likes": likes,
                "URL": url
            })

        except Exception:
            continue

    return data

# ================= MAIN =================

def main():
    driver = setup_driver()

    seen_threads, seen_comments = load_seen_data()
    all_comments = []

    thread_links = get_thread_links(driver, seen_threads)
    print(f"\n✅ New threads to scrape: {len(thread_links)}")

    for i, link in enumerate(thread_links):
        if len(all_comments) >= TARGET_COMMENTS:
            break

        print(f"🚀 Scraping thread {i+1}/{len(thread_links)}")
        new_data = scrape_comments_from_thread(driver, link, seen_comments)

        for item in new_data:
            all_comments.append(item)
            seen_comments.add(item["Comment"])

        seen_threads.add(link)

    driver.quit()

    if all_comments:
        df_new = pd.DataFrame(all_comments)

        if os.path.exists("dataset_reddit_lahore.csv"):
            df_old = pd.read_csv("dataset_reddit_lahore.csv")
            df_final = pd.concat([df_old, df_new], ignore_index=True)
            df_final.drop_duplicates(subset=["Comment", "URL"], inplace=True)
        else:
            df_final = df_new

        df_final.to_csv("dataset_reddit_lahore.csv", index=False, encoding="utf-8-sig")
        print(f"\n🎉 Saved NEW data. Total rows: {len(df_final)}")
    else:
        print("❌ No new data found")

    with open("seen_threads.txt", "w", encoding="utf-8") as f:
        for url in seen_threads:
            f.write(url + "\n")

    with open("existing_comments.txt", "w", encoding="utf-8") as f:
        for comment in seen_comments:
            f.write(comment + "\n")

# ================= RUN =================

if __name__ == "__main__":
    main()
