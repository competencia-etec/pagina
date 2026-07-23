from pydantic import BaseModel, Field


class WordleInitResponse(BaseModel):
    session_id: str = Field()
    word_length: int
    max_attempts: int
