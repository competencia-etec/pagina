import hashlib
import json
import os
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse

import requests

from dotenv import load_dotenv


SCOPES = ["https://www.googleapis.com/auth/userinfo.email"]
HOST = "localhost"
PORT = 8080


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        query_params = dict(parse_qsl(parsed_url.query))

        self.server.query_params = query_params

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(b"<h1> Authorized! You can close this tab. </h1>")


class Server(HTTPServer):
    def __init__(self, host: str, port: int) -> None:
        self.query_params = {}
        super().__init__(
            server_address=(host, port), RequestHandlerClass=RequestHandler
        )


def authorize(
    redirect_uri: str, client_id: str, auth_uri: str
) -> dict[str, str]:
    state_token = hashlib.sha256(os.urandom(1024)).hexdigest()

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": " ".join(SCOPES),
        "state": state_token,
        "access_type": "offline",
    }

    url = f"{auth_uri}?{urlencode(params)}"

    if not webbrowser.open(url):
        raise RuntimeError("Failed to open browser!")

    server = Server(HOST, PORT)
    try:
        server.handle_request()
    finally:
        server.server_close()

    callback_params = server.query_params

    if callback_params.get("state") != state_token:
        print("Security Error: State token mismatch!")
        return {}

    auth_code = callback_params.get("code")
    if not auth_code:
        print("Error: No authorization code received.")
        return {}

    print(f"Successfully captured Auth Code: {auth_code}")
    return {"code": auth_code}


if __name__ == "__main__":
    load_dotenv()
    redirect_uri = os.getenv("REDIRECT_URI", "http://localhost")
    client_id = os.getenv("CLIENT_ID")
    auth_uri = os.getenv(
        "AUTH_URI", "https://accounts.google.com/o/oauth2/v2/auth"
    )

    if not client_id:
        raise RuntimeError("Invalid CLIENT_ID .env!")

    if not redirect_uri.endswith(f":{PORT}"):
        redirect_uri = f"{redirect_uri}:{PORT}"

    tokens = authorize(
        redirect_uri=redirect_uri, client_id=client_id, auth_uri=auth_uri
    )
