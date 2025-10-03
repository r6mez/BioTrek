# chat1.py
import sys
import pandas as pd
import pypdf
from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

# --- Paths ---
CACHE_DIR = Path("Cache")
PDF_DIR = Path("Data/pdfs")
DATA_DIR = Path("Data")
CHROMA_DIR = Path("BioTrek_db")
CHROMA_DIR.mkdir(exist_ok=True)

# --- Embeddings ---
embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# --- Utility ---
def split_text(text, chunk_size=500, chunk_overlap=100):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(text)

# --- Loaders ---
def load_documents_from_html():
    docs = []
    for html_file in CACHE_DIR.glob("*.html"):
        try:
            content = html_file.read_text(encoding="utf-8")
            chunks = split_text(content)
            for chunk in chunks:
                docs.append(Document(
                    page_content=chunk,
                    metadata={"title": html_file.stem, "link": html_file.name, "pub_date": html_file.stat().st_mtime}
                ))
        except Exception as e:
            print(f"Skipping HTML file {html_file} due to error: {e}")
    return docs

def load_documents_from_pdfs():
    docs = []
    for pdf_file in PDF_DIR.glob("*.pdf"):
        try:
            text = ""
            with open(pdf_file, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            chunks = split_text(text)
            for chunk in chunks:
                docs.append(Document(
                    page_content=chunk,
                    metadata={"title": pdf_file.stem, "link": pdf_file.name, "pub_date": pdf_file.stat().st_mtime}
                ))
        except Exception as e:
            print(f"Skipping PDF file {pdf_file} due to error: {e}")
    return docs

def load_documents_from_main_csv():
    """
    Load the main CSV that contains HTML links and convert each row into a Document.
    """
    docs = []
    main_csv_path = DATA_DIR / "datasets" / "SB_publication_PMC.csv"  # Updated path
    if main_csv_path.exists():
        try:
            df = pd.read_csv(main_csv_path)
            for _, row in df.iterrows():
                # Try both capitalized and lowercase column names
                title = row.get("Title") or row.get("title") or "Unknown"
                link = row.get("Link") or row.get("link") or ""
                pub_date = row.get("Pub_Date") or row.get("pub_date") or row.get("Publication Date") or row.get("Date") or ""
                
                # Create a meaningful content string from available fields
                content_parts = []
                if title and title != "Unknown":
                    content_parts.append(f"Title: {title}")
                if "Abstract" in row and pd.notna(row["Abstract"]):
                    content_parts.append(f"Abstract: {row['Abstract']}")
                elif "abstract" in row and pd.notna(row["abstract"]):
                    content_parts.append(f"Abstract: {row['abstract']}")
                if link:
                    content_parts.append(f"Link: {link}")
                
                page_content = "\n".join(content_parts) if content_parts else str(row.to_dict())
                
                docs.append(Document(
                    page_content=page_content,
                    metadata={"title": title, "link": link, "pub_date": pub_date}
                ))
        except Exception as e:
            print(f"Skipping main CSV {main_csv_path} due to error: {e}")
    return docs

# --- Vector store ---
def initialize_vector_store_from_cache():
    print("[INFO] Gathering documents from HTML, PDFs, main CSV ...", file=sys.stderr)
    html_docs = load_documents_from_html()
    pdf_docs = load_documents_from_pdfs()
    main_csv_docs = load_documents_from_main_csv()
    all_docs = html_docs + pdf_docs + main_csv_docs
    print(f"[INFO] Total chunks to index: {len(all_docs)}", file=sys.stderr)

    db = Chroma.from_documents(
        documents=all_docs,
        embedding=embedding_function,
        persist_directory=str(CHROMA_DIR)
    )
    print("[INFO] Vector store built and persisted successfully.", file=sys.stderr)
    return db

def load_or_build_vector_store():
    if CHROMA_DIR.exists() and any(CHROMA_DIR.iterdir()):
        print("[INFO] Loading existing vector store...", file=sys.stderr)
        db = Chroma(
            persist_directory=str(CHROMA_DIR),
            embedding_function=embedding_function
        )
    else:
        db = initialize_vector_store_from_cache()
    return db

# --- Main ---
if __name__ == "__main__":
    db = load_or_build_vector_store()
    print("[INFO] Vector store ready!", file=sys.stderr)
