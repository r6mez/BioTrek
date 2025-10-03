#!/usr/bin/env python3
"""
Rebuild the vector database with new chunking settings
"""
import shutil
from pathlib import Path
from chat1 import initialize_vector_store_from_cache, CHROMA_DIR

def rebuild_vector_store():
    """Delete old vector store and rebuild with new settings"""
    
    # Delete old vector store
    if CHROMA_DIR.exists():
        print(f"Deleting old vector store at {CHROMA_DIR}...")
        shutil.rmtree(CHROMA_DIR)
        print("Old vector store deleted.")
    
    # Rebuild with new chunking settings
    print("Building new vector store with improved settings...")
    print("- Chunk size: 1000 (was 500)")
    print("- Chunk overlap: 200 (was 100)")
    print("- Better text separators")
    
    db = initialize_vector_store_from_cache()
    
    print("\n✅ Vector store rebuilt successfully!")
    print("Restart your backend to use the new database.")

if __name__ == "__main__":
    rebuild_vector_store()


