import os

class Config:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAQbcKDHvqtGw1UTgXCQ8uaq13PYOgRdfA")
    DATABASE_PATH = 'xrstarter.db'
