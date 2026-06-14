from passlib.context import CryptContext
from sqlalchemy import create_engine, text

DB_USER = "postgres"
DB_PASSWORD = "project26"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "data"

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(username: str, password: str):
    hashed = pwd_context.hash(password)
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO users (username, hashed_password)
            VALUES (:username, :hashed_password)
        """), {"username": username, "hashed_password": hashed})
        conn.commit()
        print(f"✅ User '{username}' created successfully")

if __name__ == "__main__":
    username = input("Username: ")
    password = input("Password: ")
    create_user(username, password)