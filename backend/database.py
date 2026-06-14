from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. HIER DEINE POSTGRESQL VERBINDUNG EINTRAGEN
DATABASE_URL = "postgresql+psycopg2://postpip install psycopg2-binary sqlalchemy pandasgres:#Esbenna2903@localhost:5432/data"

# 2. Engine (das ist genau das, was dir gefehlt hat)
engine = create_engine(DATABASE_URL, echo=True)

# 3. Session für spätere DB-Zugriffe
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Basis für deine Models (Stocks, Transactions etc.)
Base = declarative_base()