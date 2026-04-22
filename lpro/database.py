import sqlite3
import json
import os

DB_PATH = 'xrstarter.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            avatar TEXT,
            total_xp INTEGER,
            level INTEGER,
            current_streak INTEGER
        )
    ''')
    
    # 2. Research Papers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS research_papers (
            id TEXT PRIMARY KEY,
            title TEXT,
            abstract TEXT,
            authors TEXT,
            published_at TEXT,
            citations INTEGER,
            category TEXT,
            tags TEXT,
            icon TEXT
        )
    ''')
    
    conn.commit()
    
    # Seed Data if empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO users (id, name, email, avatar, total_xp, level, current_streak)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', ('1', 'Laxmichandra Manne', '24881A67G5@student.vardhaman.org', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laxmichandra&backgroundColor=6366f1', 2580, 2, 7))
        
        papers = [
            ('doi-10-1038-xr-vce', 'Topological Mapping of Graph Neural Networks across Spatial Render Matrices', 'This paper details the VCE algorithmic framework for compiling heavy-weight graph structures directly onto the LPRO WebGL pipeline.', 'L. Manne, Dr. S. Chen', '2026-03-12', 142, 'Spatial Algorithms', json.dumps(['Graph Theory', 'LPRO Engine', 'Data Science']), 'FileText'),
            ('res-8821', 'Dynamic Algorithmic Flow Clustering on Edge Device Nodes in XR', 'Analyzing K-Means and DBSCAN variations executing directly within edge-rendered cognitive systems.', 'L. Manne (Lead)', '2026-02-28', 89, 'Machine Learning', json.dumps(['Clustering', 'XR Ops', 'Data Mining']), 'Database'),
            ('res-8822', 'Predictive Latency Models for Hand-Tracking via OpenCV', 'A breakdown of the Irma diagnostic latency pipeline utilizing the internal system clock to offset Python to React postMessage network bottlenecks.', 'VCE Research Group', '2026-01-20', 210, 'Computer Vision', json.dumps(['OpenCV', 'Prediction', 'Telemetry']), 'Cpu'),
            ('res-8823', 'Structural Architecture of the Irma Multimodal Bridge', 'How to bypass cross-origin browser lockouts by scraping raw WebGL pixel data arrays and packaging them via Base64 for Google Gemini architecture.', 'L. Manne', '2025-11-05', 345, 'Systems Design', json.dumps(['Multimodal', 'WebGL', 'API Architecture']), 'Network')
        ]
        
        cursor.executemany('''
            INSERT INTO research_papers (id, title, abstract, authors, published_at, citations, category, tags, icon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', papers)
        
        conn.commit()

    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
