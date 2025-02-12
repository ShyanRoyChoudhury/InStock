

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

# from create_product import create_product




from middleware.cspMiddleware import CSPMiddleware
from api.webhooks.webhook_api import router as webhooks_router
from api.products.products_api import router as products_router
app = FastAPI()

# Add CSP middleware before CORS
app.add_middleware(CSPMiddleware)

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks_router)
app.include_router(products_router)
