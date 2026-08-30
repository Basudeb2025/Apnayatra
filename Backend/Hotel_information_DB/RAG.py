import chromadb
import os
from dotenv import load_dotenv
import re
load_dotenv()  # Load environment variables from .env file


# cloud_host = os.getenv("cloud_host")  # or europe-west1.gcp.trychroma.com
# cloud_port = int(os.getenv("cloud_port"))
# api_key = os.getenv("api_key")
# tenant = os.getenv("tenant")
# database = os.getenv("database")

_client = None
_collection = None


def get_client():
    global _client
    if _client is None:
        _client = chromadb.CloudClient(
            cloud_host="",
            cloud_port=443,
            api_key="",
            tenant="1",
            database="",
        )
    return _client


def get_collection(name="hotels"):
    global _collection
    if _collection is None:
        _collection = get_client().get_or_create_collection(name)
    return _collection

from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEndpointEmbeddings

embedding = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
)

def store_hotel(hotel_name: str, city: str, content: str, collection_name="hotels"):
    """
    Store a single hotel entry into ChromaDB with embeddings + metadata.
    """
    doc = Document(
        page_content=content,
        metadata={
            "hotel_name": hotel_name,
            "city": city
        }
    )

    collection = get_collection(collection_name)
    vector = embedding.embed_query(doc.page_content)

    collection.add(
        ids=[f"hotel-{hotel_name}-{city}"],
        embeddings=[vector],
        metadatas=[doc.metadata],
        documents=[doc.page_content]
    )
    print(f"✅ Stored hotel '{hotel_name}' in {city} (collection: {collection_name}).")

async def retrieve(query: str, k=2):
    print("calling the functions")
    collection = get_collection("hotels")
    query_vector = embedding.embed_query(query)

    # Example: parse hotel and city from query (simplified)
    city_match = re.search(r"in (\w+)", query.lower())
    hotel_match = re.search(r"hotel (\w+)", query.lower())

    where_filter = None
    if city_match and hotel_match:
        where_filter = {
            "$and": [
                {"city": city_match.group(1).capitalize()},
                {"hotel_name": hotel_match.group(1).capitalize()}
            ]
        }
    elif city_match:
        where_filter = {"city": city_match.group(1).capitalize()}
    elif hotel_match:
        where_filter = {"hotel_name": hotel_match.group(1).capitalize()}

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        where=where_filter
    )

    if not results or not results["metadatas"] or not results["metadatas"][0]:
        return "No matching hotels found."

    output = ""
    for meta, doc in zip(results["metadatas"][0], results["documents"][0]):
        output += f"Hotel: {meta['hotel_name']}\nCity: {meta['city']}\nDetails: {doc}\n------\n"
    return output

