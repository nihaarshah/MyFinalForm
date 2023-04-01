import modal
from langchain.document_loaders import UnstructuredHTMLLoader
from langchain.indexes import VectorstoreIndexCreator
import os
import urllib

stub = modal.Stub(
    "example-kasakai",
    image=modal.Image.debian_slim().pip_install("langchain", "openai","unstructured","chromadb","bs4")
)

os.environ['OPENAI_API_KEY'] = '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'
# volume = modal.SharedVolume().persist("past_saved_htmls_vol")
# CACHE_PATH = "/root/model_cache"

@stub.webhook(method="GET")
def qanda(url,query):
    html_name = url.split("/")[-1]
    a, b = urllib.request.urlretrieve(url, html_name + '.html')
    loader = UnstructuredHTMLLoader(a)
    index = VectorstoreIndexCreator().from_loaders([loader])

    ans = index.query(query)
    return ans

@stub.local_entrypoint
def query_main(url,query):
    qanda(url,query)


