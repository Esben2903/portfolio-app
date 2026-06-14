from passlib.context import CryptContext
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://postgres:project26@localhost:5432/data"
engine = create_engine(DATABASE_URL)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

with engine.connect() as conn:
    user = conn.execute(text("SELECT username, hashed_password FROM users WHERE id = 4")).fetchone()
    print("Username:", user.username)
    print("Hash:", user.hashed_password)
    
    test_password = input("Enter your password to test: ")
    result = pwd_context.verify(test_password, user.hashed_password)
    print("Password match:", result)