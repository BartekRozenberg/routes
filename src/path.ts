document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    const gridContainer = document.getElementById('grid-container')!;
    const pathCanvas = document.getElementById('path-canvas') as HTMLCanvasElement;
    const savePathButton = document.getElementById('save-path-button')!;
    const boardId = (document.getElementById('board-id') as HTMLInputElement).value;

    let path: { row: number; col: number }[] = [];
    let dots: { row: number; col: number; color: string }[] = [];
    let rows = 0;
    let cols = 0;
    let currentPathColor: string | null = null;
    let pathColor: string | null = null; // Kolor aktualnej ścieżki
    let isPathComplete = path.length > 0; // Ustaw flagę zakończenia ścieżki
    if (path.length > 0) {
        let first = path[0]; // Ustaw pierwszy punkt ścieżki
        pathColor = dots.find(dot => dot.row === first.row && dot.col === first.col)?.color || null; // Ustaw kolor ścieżki na kolor pierwszej kropki
        currentPathColor = pathColor; // Ustaw kolor aktualnej ścieżki na kolor pierwszej kropki
        console.log('Path color set to:', pathColor);
    }


    const ctx = pathCanvas.getContext('2d')!;

    console.log('Grid container element:', gridContainer);

    /**
     * Dodaje nowy punkt do ścieżki.
     * @param row Wiersz klikniętej komórki.
     * @param col Kolumna klikniętej komórki.
     * @param isDot Czy kliknięta komórka to kropka.
     * @param dotColor Kolor kropki (jeśli kliknięta komórka to kropka).
     */
    const addPointToPath = (row: number, col: number, isDot: boolean, dotColor: string | null = null) => {
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
            } else if (lastPoint.col === col) {
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
            } else if (currentPathColor === dotColor && path.length > 0) {
                // Zakończ ścieżkę na drugiej kropce tego samego koloru
                path.push({ row, col });
                console.log('Path ended at second dot with color:', currentPathColor);
                currentPathColor = null; // Zresetuj kolor ścieżki
                isPathComplete = true; // Oznacz ścieżkę jako zakończoną
            }
        } else {
            // Jeśli kliknięto na zwykłą komórkę
            if (currentPathColor && path.length > 0) {
                path.push({ row, col });
                console.log('Point added to path:', { row, col });
            }
        }

        // Narysuj zaktualizowaną ścieżkę
        drawPath();
    };

    const removeLastPoint = () => {
        if (path.length === 0) {
            console.log('No points to remove.');
            return; // Nie ma punktów do usunięcia
        }

        const lastPoint = path[path.length - 1];
        console.log('Removing last point:', lastPoint);

        // Usuń ostatni punkt
        path.pop();

        // Jeśli ścieżka jest pusta, zresetuj kolor ścieżki i oznacz ją jako edytowalną
        if (path.length === 0) {
            currentPathColor = null;
            pathColor = null;
            isPathComplete = false;
            console.log('Path is now empty and editable.');
        } else {
            // Jeśli ścieżka nadal istnieje, oznacz ją jako edytowalną
            currentPathColor = pathColor; // Ustaw kolor ścieżki na kolor ostatniego punktu
            isPathComplete = false;
            console.log('Path is now editable.');
        }

        // Narysuj zaktualizowaną ścieżkę
        resizeCanvas(); // Dopasuj rozmiar canvasu
        drawPath();
    };

    // Funkcja do generowania planszy z kropkami
    const generateGrid = (rows: number, cols: number) => {
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
        const target = event.target as HTMLElement;

        // Sprawdź, czy kliknięto na komórkę siatki
        const cell = target.closest('[data-row][data-col]') as HTMLElement;
        if (!cell) return;

        const row = parseInt(cell.dataset.row!);
        const col = parseInt(cell.dataset.col!);

        // Sprawdź, czy kliknięto na kropkę
        const dot = dots.find(dot => dot.row === row && dot.col === col);
        if (dot) {
            addPointToPath(row, col, true, dot.color);
        } else {
            addPointToPath(row, col, false);
        }
    });

    // Funkcja do rysowania ścieżki na canvasie
    const drawPath = () => {
        console.log('Drawing path with current path color:', pathColor);
        const rect = gridContainer.getBoundingClientRect();
        console.log('Canvas bounding rect:', rect);
        console.log('Canvas size:', { width: rect.width, height: rect.height });
        const cellWidth = rect.width / cols;  // Szerokość jednej komórki
        const cellHeight = rect.height / rows; // Wysokość jednej komórki
        const pointRadius = Math.min(cellWidth, cellHeight) * 0.1; // Promień punktu (25% wielkości komórki)
        const lineWidth = pointRadius * 2; // Grubość linii

        ctx.clearRect(0, 0, rect.width, rect.height); // Wyczyść canvas
        ctx.beginPath();

        path.forEach(({ row, col }, index) => {
            const x = lineWidth + col * cellWidth + cellWidth / 2; // Środek komórki w osi X
            const y = lineWidth + row * cellHeight + cellHeight / 2; // Środek komórki w osi Y

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            console.log('Drawing point at:', { x, y });
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
    const loadBoardData = async () => {
        const response = await fetch(`/routes/${boardId}/load_path/`);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data); // Loguj całą odpowiedź serwera

            // Załaduj dane planszy
            dots = data.dots || [];
            rows = data.rows; // Przypisz liczbę wierszy
            cols = data.cols; // Przypisz liczbę kolumn
            generateGrid(rows, cols);

            // Załaduj wszystkie ścieżki
            const pathId = parseInt((document.getElementById('path-id') as HTMLInputElement).value);
            const existingPath = data.paths.find((pathData: any) => pathData.id === pathId);

            if (existingPath) {
                path = existingPath.path_data || []; // Załaduj istniejące punkty ścieżki
                pathColor = dots.find(dot => dot.row === path[0]?.row && dot.col === path[0]?.col)?.color || null;
                console.log('Loaded existing path:', path);
                isPathComplete = path.length > 0; // Ustaw flagę zakończenia ścieżki
            } else {
                console.log('No existing path found for this ID.');
            }

            resizeCanvas(); // Dopasuj rozmiar canvasu po załadowaniu danych
            drawPath();
            console.log('Dane załadowane. Grid generated with rows:', rows, 'cols:', cols);
        } else {
            alert('Błąd podczas ładowania danych planszy.');
        }
    };

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
    savePathButton.addEventListener('click', async () => {
        // Sprawdź, czy ścieżka jest zakończona
        if (!isPathComplete) {
            alert('Nie można zapisać ścieżki, ponieważ nie jest zakończona. Upewnij się, że ścieżka kończy się w kropce.');
            return; // Zablokuj zapis
        }

        const pathId = (document.getElementById('path-id') as HTMLInputElement).value;
        const pathName = (document.getElementById('path-name') as HTMLInputElement).value; // Pobierz nazwę ścieżki

        const response = await fetch(`/routes/${boardId}/save_path/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement).value,
            },
            body: JSON.stringify({ path_id: pathId, path_name: pathName, path_data: path }),
        });

        if (response.ok) {
            alert('Ścieżka została zapisana!');
        } else {
            alert('Błąd podczas zapisywania ścieżki.');
        }
    });

    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('click', (event) => {
        console.log('Document clicked:', event);
        const target = event.target as HTMLElement;

        // Sprawdź, czy kliknięto na canvas
        if (target === pathCanvas) {
            const rect = pathCanvas.getBoundingClientRect();
            const gridRect = gridContainer.getBoundingClientRect();
            const clickX = event.clientX - gridRect.left; // Współrzędna X kliknięcia w canvasie
            const clickY = event.clientY - gridRect.top;  // Współrzędna Y kliknięcia w canvasie
            console.log('Click coordinates on canvas:', { clickX, clickY });

            // Przelicz współrzędne kliknięcia na wiersz i kolumnę siatki
            const cellWidth = rect.width / cols;  // Szerokość jednej komórki
            const cellHeight = rect.height / rows; // Wysokość jednej komórki

            const col = Math.floor(clickX / cellWidth); // Kolumna siatki
            const row = Math.floor(clickY / cellHeight); // Wiersz siatki

            console.log('Grid coordinates:', { row, col });

            // Sprawdź, czy kliknięto na ostatni punkt ścieżki
            const lastPoint = path[path.length - 1];
            if (lastPoint && lastPoint.row === row && lastPoint.col === col) {
                console.log('Clicked on the last point of the path.');
                removeLastPoint();
                return;
            }

            // Sprawdź, czy kliknięto na kropkę
            const dot = dots.find(dot => dot.row === row && dot.col === col);
            if (dot) {
                addPointToPath(row, col, true, dot.color);
            } else {
                addPointToPath(row, col, false);
            }
        }
    });

    const showTemporaryFeedback = (x: number, y: number, color: string) => {
        const feedback = document.createElement('div');
        feedback.style.position = 'absolute';
        feedback.style.width = '20px'; // Rozmiar kółka
        feedback.style.height = '20px';
        feedback.style.backgroundColor = color;
        feedback.style.borderRadius = '50%';
        feedback.style.left = `${x - 10}px`; // Wyśrodkowanie kółka
        feedback.style.top = `${y - 10}px`;
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '1000';
        feedback.style.transition = 'opacity 0.5s ease'; // Płynne zanikanie
        feedback.style.opacity = '1';

        document.body.appendChild(feedback);

        // Usuń kółko po krótkim czasie
        setTimeout(() => {
            feedback.style.opacity = '0'; // Zmień przezroczystość na 0
            setTimeout(() => feedback.remove(), 500); // Usuń element po zakończeniu animacji
        }, 500);
    };

    // Inicjalizacja
    console.log('Initializing path drawing...');
    resizeCanvas();
    console.log('Canvas size set to:', pathCanvas.width, 'x', pathCanvas.height);
    console.log('Initializing the board with ID:', boardId);
    loadBoardData();
});