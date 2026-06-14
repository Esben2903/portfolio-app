from sqlalchemy import create_engine, text

# 🔧 HIER deine echten Daten eintragen
DB_USER = "postgres"
DB_PASSWORD = "project26"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "data"

engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Verbindung testen + Daten holen
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM stocks;"))

    for row in result:
        print(row)