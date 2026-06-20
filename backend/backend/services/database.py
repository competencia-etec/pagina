from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)


# Add
with engine.begin() as conn:
    conn.execute(text("CREATE TABLE some_table (x int, y int)"))
    conn.execute(
        text("INSERT INTO some_table (x, y) VALUES (:x, :y)"),
        [{"x": 1, "y": 1}, {"x": 2, "y": 4}],
    )
#
# # Read
# with engine.begin() as conn:
#     result = conn.execute(text("SELECT x, y FROM some_table"))
#
#     for row in result:
#         print(f"x: {row.x}  y: {row.y}")


# Using sessions
stmt = text("SELECT x, y FROM some_table WHERE y > :y ORDER BY x, y")
with Session(engine) as session:
    result = session.execute(stmt, {"y": 1})

    for row in result:
        print(f"x: {row.x}  y: {row.y}")
