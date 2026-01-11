import sqlite3

conn = sqlite3.connect('smart_road_system.db')
c = conn.cursor()

# Get all roads with their latitude/longitude
rows = c.execute('SELECT id, latitude, longitude FROM road_projects').fetchall()
print(f"Found {len(rows)} roads")

for row in rows:
    road_id, lat, lon = row
    new_lat = None
    new_lon = None
    
    # Convert integers to proper decimal format
    if lat is not None:
        try:
            new_lat = float(lat)
            # If it's a small integer, it's likely degrees
            if -90 <= new_lat <= 90:
                new_lat = new_lat
            else:
                # Invalid latitude, set to None
                new_lat = None
        except:
            new_lat = None
    
    if lon is not None:
        try:
            new_lon = float(lon)
            # If it's a small integer, it's likely degrees
            if -180 <= new_lon <= 180:
                new_lon = new_lon
            else:
                # Invalid longitude, set to None
                new_lon = None
        except:
            new_lon = None
    
    c.execute('UPDATE road_projects SET latitude=?, longitude=? WHERE id=?', (new_lat, new_lon, road_id))
    print(f"Updated road {road_id}: lat={new_lat}, lon={new_lon}")

conn.commit()
print("Database updated!")
conn.close()
