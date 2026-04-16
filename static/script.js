document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('run-btn');
    const mapGrid = document.getElementById('map-grid');
    const pathInfo = document.getElementById('path-info');
    const scheduleContainer = document.getElementById('schedule-container');
    const locSelect = document.getElementById('loc-select');

    runBtn.addEventListener('click', async () => {
        runBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        runBtn.disabled = true;

        const options = Array.from(locSelect.selectedOptions);
        const targetLocs = options.map(opt => opt.value).join(',');

        try {
            const response = await fetch('/api/run?loc=' + targetLocs);
            const data = await response.json();
            
            renderMap(data);
            renderSchedule(data);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert("Error connecting to the backend logic. Ensure app.py is running!");
        } finally {
            runBtn.innerHTML = '<i class="fa-solid fa-route"></i> Calculate Route';
            runBtn.disabled = false;
        }
    });

    function renderMap(data) {
        const { grid, warehouse, locations, tasks } = data;
        const rows = grid.length;
        const cols = grid[0].length;
        
        mapGrid.innerHTML = '';
        mapGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        const destCoords = {};
        for (const [key, val] of Object.entries(locations)) {
            destCoords[`${val[0]},${val[1]}`] = key;
        }

        const cells = [];
        for (let r = 0; r < rows; r++) {
            const rowCells = [];
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                const coordKey = `${r},${c}`;
                
                if (r === warehouse[0] && c === warehouse[1]) {
                    cell.classList.add('cell-warehouse');
                    cell.innerHTML = '<i class="fa-solid fa-building"></i>';
                } else if (destCoords[coordKey]) {
                    const locName = destCoords[coordKey];
                    cell.innerText = locName;
                    
                    const isTarget = tasks.some(t => t.target === locName);
                    if (isTarget) {
                        cell.classList.add('cell-dest-best');
                    } else {
                        cell.classList.add('cell-dest');
                    }
                } else if (grid[r][c] === 1) {
                    cell.classList.add('cell-obstacle');
                }
                
                mapGrid.appendChild(cell);
                rowCells.push(cell);
            }
            cells.push(rowCells);
        }

        pathInfo.innerHTML = `Dispatched <span>${tasks.length}</span> concurrent tasks.`;
        
        tasks.forEach((task, tIndex) => {
            if (task.path && task.path.length > 0) {
                task.path.forEach((pos, index) => {
                    setTimeout(() => {
                        const r = pos[0];
                        const c = pos[1];
                        const cell = cells[r][c];
                        if (!cell.classList.contains('cell-warehouse') && !cell.classList.contains('cell-dest-best')) {
                            cell.classList.add('cell-path');
                        }
                    }, (index * 150) + (tIndex * 200));
                });
            }
        });
    }

    function renderSchedule(data) {
        scheduleContainer.innerHTML = '';
        
        if (!data.tasks || data.tasks.length === 0) {
            scheduleContainer.innerHTML = '<div class="placeholder"><i class="fa-solid fa-ban"></i> No tasks assigned</div>';
            return;
        }

        data.tasks.forEach((task, idx) => {
            const { assigned_driver, target, eta_minutes } = task;
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.style.borderLeftColor = assigned_driver.includes("NO") ? 'var(--danger)' : 'var(--accent)';
            
            item.innerHTML = `
                <div class="slot-name">
                    <i class="fa-solid fa-truck"></i>
                    Target ${target} (ETA: ${eta_minutes}m)
                </div>
                <div class="driver-badge" style="color: ${assigned_driver.includes("NO") ? 'var(--danger)' : ''}">
                    <i class="fa-solid fa-id-badge"></i> ${assigned_driver}
                </div>
            `;
            
            scheduleContainer.appendChild(item);
            
            setTimeout(() => {
                item.classList.add('show');
            }, 50 + (idx * 100));
        });
    }

    runBtn.click();
});
