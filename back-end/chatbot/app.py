# app.py

from datetime import datetime
from chat1 import embedding_function, load_or_build_vector_store
from chat2 import setup_retrieval_qa

# Load or build vector store
db = load_or_build_vector_store()

# Initialize retrieval QA chain
chain = setup_retrieval_qa(db, max_words=600)

last_sources = []

from datetime import datetime

def print_timeline(source_docs):
    items = []
    for s in source_docs:
        md = s.metadata if hasattr(s, "metadata") else s.get("metadata", {})
        title = md.get("title") or md.get("filename") or "Unknown"
        link = md.get("link") or md.get("filename") or ""
        pd = md.get("pub_date")
        # convert timestamp to YYYY-MM-DD
        if isinstance(pd, (int, float)):
            pd = datetime.fromtimestamp(pd).strftime("%Y-%m-%d")
        else:
            pd = pd or "unknown date"
        items.append({"title": title, "link": link, "pub_date": pd})
    items_sorted = sorted(items, key=lambda x: x["pub_date"])
    print("\nTimeline (oldest → newest):")
    for it in items_sorted:
        print(f"- {it['pub_date']} | {it['title']}\n  {it['link']}")
    print()


def print_references(source_docs):
    print("\nReferences:")
    for i, s in enumerate(source_docs, start=1):
        md = s.metadata if hasattr(s, "metadata") else s.get("metadata", {})
        title = md.get("title") or md.get("filename") or "Unknown"
        link = md.get("link") or md.get("filename") or ""
        print(f"[{i}] {title} — {link}")
    print()

def show_full_evidence(source_docs):
    print("\nFull evidence snippets:\n")
    for i, s in enumerate(source_docs, start=1):
        md = s.metadata if hasattr(s, "metadata") else s.get("metadata", {})
        title = md.get("title") or md.get("filename") or "Unknown"
        link = md.get("link") or md.get("filename") or ""
        content = s.page_content if hasattr(s, "page_content") else s.get("page_content", "")
        print(f"--- Source [{i}] {title} — {link}\n{content[:3000]}\n\n")

def ask_question(chain):
    global last_sources
    first_time = True
    while True:
        if first_time:
            query = input("🤖 Hello, ask me about NASA BioTrek research (type 'exit' to quit):\n🧑‍🚀 ").strip()
            first_time = False
        else:
            query = input("🧑‍🚀 You: ").strip()

        if query.lower() in ["exit", "q"]:
            print("🤖 Goodbye!\n")
            break

        if query.lower() == "rebuild":
            print("Rebuilding vector DB from Cache...")
            load_or_build_vector_store()
            print("Done. Restart program to load new DB.")
            break

        if query.lower() == "timeline":
            if last_sources:
                print_timeline(last_sources)
            else:
                print("No last query sources available.")
            continue

        if query.lower() in ["refs", "references"]:
            if last_sources:
                print_references(last_sources)
            else:
                print("No last query sources available.")
            continue

        if query.lower() in ["evidence", "full evidence"]:
            if last_sources:
                show_full_evidence(last_sources)
            else:
                print("No last query sources available.")
            continue

        response = chain.invoke(query)
        
        # Only store sources if they exist and are relevant
        if isinstance(response, dict) and "source_documents" in response:
            source_docs = response["source_documents"]
            # Filter out empty or irrelevant sources
            if source_docs and len(source_docs) > 0:
                last_sources = source_docs
            else:
                last_sources = []
        else:
            last_sources = []

        if isinstance(response, dict) and "result" in response:
            answer = response['result']
            print(f"\n🤖\n{answer}\n")
            
            # Show sources info only if we have relevant sources
            if last_sources:
                print(f"📚 Found {len(last_sources)} relevant source(s). Type 'refs' to see references or 'timeline' to see timeline.\n")
        else:
            print(f"\n🤖\n{response}\n")

if __name__ == "__main__":
    ask_question(chain)
