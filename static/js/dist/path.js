var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    const gridContainer = document.getElementById('grid-container');
    const pathCanvas = document.getElementById('path-canvas');
    const savePathButton = document.getElementById('save-path-button');
    const boardId = document.getElementById('board-id').value;
    let path = [];
    let dots = [];
    let rows = 0;
    let cols = 0;
    let currentPathColor = null;
    let pathColor = null; // Kolor aktualnej ścieżki
    let isPathComplete = false; // Flaga wskazująca, czy ścieżka została zakończona
    const ctx = pathCanvas.getContext('2d');
    console.log('Grid container element:', gridContainer);
    /**
     * Dodaje nowy punkt do ścieżki.
     * @param row Wiersz klikniętej komórki.
     * @param col Kolumna klikniętej komórki.
     * @param isDot Czy kliknięta komórka to kropka.
     * @param dotColor Kolor kropki (jeśli kliknięta komórka to kropka).
     */
    const addPointToPath = (row, col, isDot, dotColor = null) => {
        console.log(`Adding point to path at row: ${row}, col: ${col}, isDot: ${isDot}, dotColor: ${dotColor}`);
        // Sprawdź, czy ścieżka została zakończona
        if (isPathComplete) {
            console.log('Cannot add points: Path is already complete.');
            return; // Nie pozwól na dodawanie nowych punktów
        }
        // Sprawdź, czy punkt już istnieje w ścieżce
        if (path.some(point => point.row === row && point.col === col)) {
            console.log('Invalid move: Point already exists in the path.');
            return; // Nie dodawaj punktu, jeśli już istnieje w ścieżce
        }
        // Sprawdź, czy kliknięto na kropkę w innym kolorze
        if (isDot && currentPathColor && dotColor !== currentPathColor) {
            console.log('Invalid move: Dot color does not match the current path color.');
            return; // Nie dodawaj punktu, jeśli kropka ma inny kolor
        }
        if (path.length > 0) {
            const lastPoint = path[path.length - 1];
            // Sprawdź, czy nowy punkt jest w tej samej kolumnie lub wierszu co ostatni punkt
            if (lastPoint.row !== row && lastPoint.col !== col) {
                console.log('Invalid move: Points must be in the same row or column.');
                return; // Nie dodawaj punktu, jeśli nie spełnia warunku
            }
            // Sprawdź, czy na linii między ostatnim punktem a nowym punktem znajduje się kropka w innym kolorze
            if (lastPoint.row === row) {
                const startCol = Math.min(lastPoint.col, col);
                const endCol = Math.max(lastPoint.col, col);
                for (let c = startCol + 1; c < endCol; c++) {
                    const dot = dots.find(dot => dot.row === row && dot.col === c);
                    if (dot && dot.color !== currentPathColor) {
                        console.log('Invalid move: Dot with a different color is on the same row.');
                        return; // Nie dodawaj punktu, jeśli na linii znajduje się kropka w innym kolorze
                    }
                }
            }
            else if (lastPoint.col === col) {
                const startRow = Math.min(lastPoint.row, row);
                const endRow = Math.max(lastPoint.row, row);
                for (let r = startRow + 1; r < endRow; r++) {
                    const dot = dots.find(dot => dot.row === r && dot.col === col);
                    if (dot && dot.color !== currentPathColor) {
                        console.log('Invalid move: Dot with a different color is on the same column.');
                        return; // Nie dodawaj punktu, jeśli na linii znajduje się kropka w innym kolorze
                    }
                }
            }
        }
        if (isDot) {
            // Jeśli kliknięto na kropkę
            if (path.length === 0) {
                // Rozpocznij ścieżkę od tej kropki
                currentPathColor = dotColor; // Ustaw kolor ścieżki na kolor pierwszej kropki
                pathColor = dotColor; // Zapisz kolor ścieżki
                path.push({ row, col });
                console.log('Path started with color:', pathColor);
            }
            else if (currentPathColor === dotColor && path.length > 0) {
                // Zakończ ścieżkę na drugiej kropce tego samego koloru
                path.push({ row, col });
                console.log('Path ended at second dot with color:', currentPathColor);
                currentPathColor = null; // Zresetuj kolor ścieżki
                isPathComplete = true; // Oznacz ścieżkę jako zakończoną
            }
        }
        else {
            // Jeśli kliknięto na zwykłą komórkę
            if (currentPathColor && path.length > 0) {
                path.push({ row, col });
                console.log('Point added to path:', { row, col });
            }
        }
        // Narysuj zaktualizowaną ścieżkę
        drawPath();
    };
    // Funkcja do generowania planszy z kropkami
    const generateGrid = (rows, cols) => {
        console.log('Generating grid with rows:', rows, 'cols:', cols);
        gridContainer.innerHTML = ''; // Wyczyść poprzednią siatkę
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('border', 'relative');
                cell.dataset.row = r.toString();
                cell.dataset.col = c.toString();
                cell.style.position = 'relative';
                cell.style.aspectRatio = '1 / 1';
                gridContainer.appendChild(cell);
                // Wyświetl istniejące kropki
                const existingDot = dots.find(dot => dot.row === r && dot.col === c);
                if (existingDot) {
                    const dotElement = document.createElement('div');
                    dotElement.classList.add('dot');
                    dotElement.style.backgroundColor = existingDot.color;
                    dotElement.style.width = '50%';
                    dotElement.style.height = '50%';
                    dotElement.style.borderRadius = '50%';
                    dotElement.style.position = 'absolute';
                    dotElement.style.top = '25%';
                    dotElement.style.left = '25%';
                    cell.appendChild(dotElement);
                    // Zmień kursor na wskaźnik, jeśli najedziesz na kropkę
                    cell.style.cursor = 'pointer';
                }
            }
        }
    };
    // Delegacja zdarzeń dla kliknięć na komórki siatki
    gridContainer.addEventListener('click', (event) => {
        console.log('Grid container:', event);
        const target = event.target;
        // Sprawdź, czy kliknięto na komórkę siatki
        const cell = target.closest('[data-row][data-col]');
        if (!cell)
            return;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        // Sprawdź, czy kliknięto na kropkę
        const dot = dots.find(dot => dot.row === row && dot.col === col);
        if (dot) {
            addPointToPath(row, col, true, dot.color);
        }
        else {
            addPointToPath(row, col, false);
        }
    });
    // Funkcja do rysowania ścieżki na canvasie
    const drawPath = () => {
        const rect = pathCanvas.getBoundingClientRect();
        const cellWidth = rect.width / cols; // Szerokość jednej komórki
        const cellHeight = rect.height / rows; // Wysokość jednej komórki
        const pointRadius = Math.min(cellWidth, cellHeight) * 0.1; // Promień punktu (25% wielkości komórki)
        const lineWidth = pointRadius * 2; // Grubość linii
        ctx.clearRect(0, 0, pathCanvas.width, pathCanvas.height); // Wyczyść canvas
        ctx.beginPath();
        path.forEach(({ row, col }, index) => {
            const x = lineWidth + col * cellWidth + cellWidth / 2; // Środek komórki w osi X
            const y = lineWidth + row * cellHeight + cellHeight / 2; // Środek komórki w osi Y
            if (index === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
            ctx.arc(x, y, pointRadius, 0, 2 * Math.PI); // Rysuj okrąg
            ctx.fillStyle = pathColor || '#2563EB'; // Kolor punktu
        });
        ctx.strokeStyle = pathColor || '#2563EB'; // Kolor ścieżki
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        console.log('Drawing path:', path);
        console.log('Current path color:', pathColor);
    };
    // Pobierz dane planszy i kropki z serwera
    const loadBoardData = () => __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/routes/${boardId}/load_path/`);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = yield response.json();
            console.log('Response data:', data); // Loguj całą odpowiedź serwera
            dots = data.dots || [];
            path = data.path_data || [];
            rows = data.rows; // Przypisz liczbę wierszy
            cols = data.cols; // Przypisz liczbę kolumn
            generateGrid(rows, cols);
            drawPath();
            resizeCanvas(); // Wywołaj dopasowanie canvasu po załadowaniu danych
            console.log('Dane załadowane. Grid generated with rows:', rows, 'cols:', cols);
        }
        else {
            alert('Błąd podczas ładowania danych planszy.');
        }
    });
    // Ustaw rozmiar canvasu
    const resizeCanvas = () => {
        const rect = gridContainer.getBoundingClientRect();
        pathCanvas.width = rect.width;
        pathCanvas.height = rect.height;
        // Dopasuj wysokość kontenera planszy do proporcji siatki
        const cellSize = rect.width / cols; // Szerokość jednej komórki
        gridContainer.style.height = `${cellSize * rows}px`;
    };
    // Obsługa zapisu ścieżki
    savePathButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`/routes/${boardId}/save_path/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: JSON.stringify({ path_data: path }),
        });
        if (response.ok) {
            alert('Ścieżka została zapisana!');
        }
        else {
            alert('Błąd podczas zapisywania ścieżki.');
        }
    }));
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('click', (event) => {
        console.log('Document clicked:', event);
        const target = event.target;
        // Sprawdź, czy kliknięto na element wewnątrz `grid-container`
        const cell = target.closest('[data-row][data-col]');
        if (cell) {
            console.log('Cell clicked:', cell);
        }
        // Sprawdź, czy kliknięto na canvas
        if (target === pathCanvas) {
            const rect = pathCanvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left; // Współrzędna X kliknięcia w canvasie
            const clickY = event.clientY - rect.top; // Współrzędna Y kliknięcia w canvasie
            console.log('Click coordinates on canvas:', { clickX, clickY });
            // Przelicz współrzędne kliknięcia na wiersz i kolumnę siatki
            const cellWidth = rect.width / cols; // Szerokość jednej komórki
            const cellHeight = rect.height / rows; // Wysokość jednej komórki
            const col = Math.floor(clickX / cellWidth); // Kolumna siatki
            const row = Math.floor(clickY / cellHeight); // Wiersz siatki
            console.log('Grid coordinates:', { row, col });
            // Sprawdź, czy kliknięto na kropkę
            const dot = dots.find(dot => dot.row === row && dot.col === col);
            if (dot) {
                addPointToPath(row, col, true, dot.color);
            }
            else {
                addPointToPath(row, col, false);
            }
        }
    });
    // Inicjalizacja
    console.log('Initializing path drawing...');
    resizeCanvas();
    console.log('Canvas size set to:', pathCanvas.width, 'x', pathCanvas.height);
    console.log('Initializing the board with ID:', boardId);
    loadBoardData();
});
//# sourceMappingURL=path.js.map