
from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    email: EmailStr

    password: str = Field(min_length=8, max_length=128)

    role: Literal["buyer", "seller"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str
