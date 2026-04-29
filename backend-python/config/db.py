# backend-python/config/db.py
import os
import aiomysql
from dotenv import load_dotenv

load_dotenv()

# Global connection pool, set during app startup via the lifespan handler in main.py
pool: aiomysql.Pool | None = None


async def create_pool() -> None:
    """Create the async MySQL connection pool and run a quick connectivity test."""
    global pool

    print("--- Database Debug Info ---")
    print("Host:", os.getenv("DB_HOST"))
    print("User:", os.getenv("DB_USER"))
    print("Database:", os.getenv("DB_NAME"))
    print("---------------------------")
    print("Attempting to connect to MySQL...")

    pool = await aiomysql.create_pool(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        db=os.getenv("DB_NAME", "Offer_db"),
        minsize=1,
        maxsize=10,
        autocommit=True,
    )

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
    print("✅ Database connected successfully to Offer_db!")


async def close_pool() -> None:
    """Close the connection pool gracefully on app shutdown."""
    global pool
    if pool:
        pool.close()
        await pool.wait_closed()


def get_pool() -> aiomysql.Pool:
    """Return the active connection pool (used as a FastAPI dependency)."""
    if pool is None:
        raise RuntimeError("Database pool is not initialized.")
    return pool
