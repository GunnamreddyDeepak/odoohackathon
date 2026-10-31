
from getpass import getpass
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from app.core.config import settings


def test_database_connection():
    password = getpass("Enter your Supabase database password: ")

    database_url = URL.create(
        drivername="postgresql+psycopg",
        username="postgres.ecjvmxaoyknzxqpzmzab",
        password=password,
        host="aws-0-ap-northeast-2.pooler.supabase.com",
        port=5432,
        database="postgres",
    )

    engine = create_engine(database_url)

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            assert result.scalar_one() == 1

        print("Supabase PostgreSQL connected successfully!")

    finally:
        engine.dispose()


if __name__ == "__main__":
    test_database_connection()
