import sqlite3

conn = sqlite3.connect('smart_road_system.db')
c = conn.cursor()

# First, get the table names
tables = c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Tables:", [t[0] for t in tables])

# Find the road projects table (it might be named differently)
road_table = None
for table in tables:
    if 'road' in table[0].lower():
        road_table = table[0]
        break

if not road_table:
    print("Road projects table not found!")
    conn.close()
    exit(1)

print(f"Using table: {road_table}")

# Fix latitude
c.execute(f"UPDATE {road_table} SET latitude=NULL WHERE typeof(latitude) = 'text'")
print(f"Fixed latitude: {c.rowcount} rows")

# Fix longitude  
c.execute(f"UPDATE {road_table} SET longitude=NULL WHERE typeof(longitude) = 'text'")
print(f"Fixed longitude: {c.rowcount} rows")

# Fix project_cost (check if column exists)
try:
    c.execute(f"UPDATE {road_table} SET projectCost=NULL WHERE typeof(projectCost) = 'text'")
    print(f"Fixed projectCost: {c.rowcount} rows")
except:
    print("projectCost column not found or already fixed")

# Fix road_length
try:
    c.execute(f"UPDATE {road_table} SET roadLength=NULL WHERE typeof(roadLength) = 'text'")
    print(f"Fixed roadLength: {c.rowcount} rows")
except:
    print("roadLength column not found or already fixed")

conn.commit()
conn.close()
print("Database fixed!")
