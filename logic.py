import heapq

grid = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0]
]

locations = {"A": (4,4), "B": (0,4), "C": (4,0)}
warehouse = (0,0)

drivers = {"D1": True, "D2": False, "D3": True}

def astar(start, goal):
    open_list = [(0, 0, start, [start])]
    closed = set()

    while open_list:
        _, g, current, path = heapq.heappop(open_list)

        if current == goal: return path
        if current in closed: continue
        closed.add(current)

        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = current[0]+dx, current[1]+dy
            if 0 <= nx < len(grid) and 0 <= ny < len(grid[0]) and grid[nx][ny] == 0:
                h = abs(nx - goal[0]) + abs(ny - goal[1]) 
                heapq.heappush(open_list, (g + 1 + h, g + 1, (nx, ny), path + [(nx, ny)]))
    return None

def process_dispatch(locs):
    results = []
    global drivers
    drivers = {"D1": True, "D2": True, "D3": True}
    
    for loc in locs:
        if loc not in locations: continue
        
        path = astar(warehouse, locations[loc])
        if not path: continue
        
        assigned = next((d for d, is_avail in drivers.items() if is_avail), None)
        if assigned:
            drivers[assigned] = False 
        
        results.append({
            "target": loc,
            "path": path,
            "eta_minutes": (len(path) - 1) * 3, 
            "assigned_driver": assigned or "NO DRIVERS AVAILABLE",
        })
    return results

if __name__ == "__main__":
    target = input("Enter delivery locations (e.g. A,B): ").strip().upper().split(",")
    result = process_dispatch(target)
    print(result)