# chat2.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(model="gemma2-9b-it", max_tokens=1024, temperature=0.1, api_key=GROQ_API_KEY)

def setup_retrieval_qa(db, max_words=3000, similarity_score_threshold=0.7):
    retriever = db.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "score_threshold": similarity_score_threshold,
            "k": 5
        }
    )

    prompt_template = f"""
Your name is BioTrekBot. You are a specialized assistant for NASA BioTrek space biology research.

IMPORTANT: Only answer questions related to space biology, biotechnology in space, NASA research, or topics covered in your database.

If the question is NOT related to space biology or your knowledge base:
- Politely decline and explain your specialization
- Do NOT provide sources or references
- Example: "I'm specialized in NASA BioTrek space biology research. I can only answer questions about space biology, biotechnology in space, and related NASA research. Please ask me something about these topics."

If the question IS relevant and you have information:
- Answer in less than {max_words} words if possible
- Provide visualizations for numeric/tabular data if available
- Cite the sources provided in the context

If the question is relevant but you don't have enough information in the context:
- Say "I don't have enough information about this specific topic in my database."
- Do NOT make up information

CONTEXT: {{context}}
QUESTION: {{question}}"""

    PROMPT = PromptTemplate(
        template=f"[INST] {prompt_template} [/INST]",
        input_variables=["context", "question"]
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type='stuff',
        retriever=retriever,
        input_key='query',
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT},
        verbose=False
    )
    return chain
