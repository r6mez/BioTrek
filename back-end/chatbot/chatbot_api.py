#!/usr/bin/env python3
"""
Standalone API wrapper for the chatbot that can be called from Node.js
"""
import sys
import json
import os
from pathlib import Path

# Add the current directory to the Python path
sys.path.append(str(Path(__file__).parent))

try:
    from chat1 import load_or_build_vector_store
    from chat2 import setup_retrieval_qa
    from datetime import datetime
except ImportError as e:
    print(json.dumps({"error": f"Import error: {str(e)}"}))
    sys.exit(1)

def initialize_chatbot():
    """Initialize the chatbot components"""
    try:
        db = load_or_build_vector_store()
        # Lower similarity threshold for better retrieval
        chain = setup_retrieval_qa(db, max_words=800, similarity_score_threshold=0.25)
        return db, chain
    except Exception as e:
        print(json.dumps({"error": f"Initialization error: {str(e)}"}))
        sys.exit(1)

def format_sources(source_docs):
    """Format source documents for JSON response"""
    sources = []
    references = []
    timeline = []
    
    for i, s in enumerate(source_docs, start=1):
        md = s.metadata if hasattr(s, "metadata") else s.get("metadata", {})
        
        # Try various metadata field names for title
        title = (md.get("title") or md.get("Title") or 
                md.get("filename") or md.get("Filename") or 
                md.get("name") or md.get("Name") or "Unknown")
        
        # Try various metadata field names for link
        link = (md.get("link") or md.get("Link") or 
               md.get("url") or md.get("URL") or 
               md.get("href") or "")
        
        # Try various metadata field names for publication date
        pd = (md.get("pub_date") or md.get("Pub_Date") or 
             md.get("Publication Date") or md.get("publication_date") or
             md.get("Date") or md.get("date"))
        
        # Convert timestamp to YYYY-MM-DD
        if isinstance(pd, (int, float)):
            try:
                pd = datetime.fromtimestamp(pd).strftime("%Y-%m-%d")
            except (ValueError, OSError):
                pd = ""
        elif pd and isinstance(pd, str) and pd not in ["", "1970-01-01", "unknown date"]:
            # Already a string date, keep it
            pd = pd
        else:
            # Empty or invalid date
            pd = ""
        
        content = s.page_content if hasattr(s, "page_content") else s.get("page_content", "")
        
        # Truncate content but try to keep complete metadata representation
        if len(content) > 500:
            content = content[:500] + "..."
        
        sources.append({
            "title": title,
            "link": link,
            "pub_date": pd if pd else "No date available",
            "content": content
        })
        
        references.append(f"[{i}] {title} — {link}")
        
        # Format timeline entry with or without date
        if pd:
            timeline.append(f"{pd} | {title}")
        else:
            timeline.append(f"No date | {title}")
    
    # Sort timeline by date (items with 'No date' will appear first)
    timeline.sort()
    
    return sources, references, timeline

def process_query(query, db, chain):
    """Process a single query and return formatted response"""
    try:
        response = chain.invoke(query)
        
        # Only include sources if they exist and are relevant
        if isinstance(response, dict) and "source_documents" in response:
            source_docs = response["source_documents"]
            # Filter out empty or irrelevant sources
            if not source_docs or len(source_docs) == 0:
                source_docs = []
        else:
            source_docs = []
        
        if isinstance(response, dict) and "result" in response:
            answer = response["result"]
        else:
            answer = str(response)
        
        # Only format sources if we have relevant ones
        if source_docs:
            sources, references, timeline = format_sources(source_docs)
        else:
            sources, references, timeline = [], [], []
        
        return {
            "answer": answer,
            "sources": sources,
            "references": references,
            "timeline": timeline,
            "has_sources": len(sources) > 0,
            "success": True
        }
    except Exception as e:
        return {
            "error": f"Query processing error: {str(e)}",
            "success": False
        }

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "init":
        # Just initialize and return success
        db, chain = initialize_chatbot()
        print(json.dumps({"success": True, "message": "Chatbot initialized"}))
    
    elif command == "query":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "No query provided"}))
            sys.exit(1)
        
        query = sys.argv[2]
        db, chain = initialize_chatbot()
        result = process_query(query, db, chain)
        print(json.dumps(result))
    
    elif command == "rebuild":
        try:
            # Rebuild the vector store
            from chat1 import initialize_vector_store_from_cache
            db = initialize_vector_store_from_cache()
            print(json.dumps({"success": True, "message": "Vector store rebuilt"}))
        except Exception as e:
            print(json.dumps({"error": f"Rebuild error: {str(e)}", "success": False}))
    
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()

