def verify_oauth_code(code: str, provider: str = "google"):
    # IN REALITY: Make an HTTP request to Google/GitHub here to verify the code.
    # For this starter, we simulate a successful Google response.
    if code == "fake_google_code":
        return {"email": "test@example.com", "id": "123456789", "provider": provider}
    raise ValueError("Invalid OAuth Code")
