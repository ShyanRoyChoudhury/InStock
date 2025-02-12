from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware

class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self' http://localhost:* https://*.myshopify.com "
            "01jkn78874eexs32jev2j4v73t-4cb94a47a86fc98efe79.myshopify.dev "
            "shopify-app-be-371114668585.asia-south1.run.app "
            "data: 'unsafe-inline' 'unsafe-eval'; "
            "connect-src 'self' https://monorail-edge.shopifysvc.com "
            "https://400wmv-ki.myshopify.com "
            "shopify-app-be-371114668585.asia-south1.run.app;"
        )
        return response