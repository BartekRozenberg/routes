document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container')!;
    const dotsInput = document.getElementById('dots-input') as HTMLInputElement;
    const rowsInput = document.querySelector('input[name="rows"]') as HTMLInputElement;
    const colsInput = document.querySelector('input[name="cols"]') as HTMLInputElement;
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    const form = document.getElementById('board-form') as HTMLFormElement;
    const boardIdInput = document.getElementById('board-id') as HTMLInputElement;

    console.log('saveButton:', saveButton);

    let dots: { row: number; col: number; color: string }[] = [];
    const colors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
        '#800000', '#808000', '#008000', '#800080', '#008080', '#000080',
        '#FFA500', '#A52A2A', '#8A2BE2', '#5F9EA0', '#FFC0CB', '#FFD700',
        '#ADFF2F', '#4B0082', '#7FFF00', '#DC143C', '#00CED1', '#9400D3'
    ];

    // Funkcja do generowania siatki
    const generateGrid = () => {
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);

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
                cell.style.position = 'relative'; // Ustawienie pozycji dla koła
                cell.style.aspectRatio = '1 / 1';
                gridContainer.appendChild(cell);

                // Obsługa kliknięcia na komórkę
                cell.addEventListener('click', (event) => {
                    showColorPalette(event, cell, r, c);
                });

                // Wyświetl istniejące punkty z bazy danych
                const existingDot = dots.find(dot => dot.row === r && dot.col === c);
                if (existingDot) {
                    console.log(`Przypisano punkt do komórki (${r}, ${c}):`, existingDot);

                    // Dodaj koło reprezentujące punkt
                    const dotElement = document.createElement('div');
                    dotElement.classList.add('dot');
                    dotElement.style.backgroundColor = existingDot.color;
                    dotElement.style.width = '50%'; // Rozmiar koła jako procent wielkości kwadratu
                    dotElement.style.height = '50%';
                    dotElement.style.borderRadius = '50%';
                    dotElement.style.position = 'absolute';
                    dotElement.style.top = '25%';
                    dotElement.style.left = '25%';
                    cell.appendChild(dotElement);
                }
            }
        }
    };

    // Funkcja do wyświetlania palety kolorów w dymku
    const showColorPalette = (event: MouseEvent, cell: HTMLElement, row: number, col: number) => {
        // Usuń istniejący dymek, jeśli jest
        const existingPalette = document.getElementById('color-palette-popup');
        if (existingPalette) existingPalette.remove();

        // Stwórz dymek z paletą kolorów
        const palettePopup = document.createElement('div');
        palettePopup.id = 'color-palette-popup';
        palettePopup.classList.add('absolute', 'bg-white', 'border', 'rounded-lg', 'p-2', 'shadow-lg');
        palettePopup.style.position = 'absolute';
        palettePopup.style.top = `${event.clientY + 200}px`;
        palettePopup.style.left = `${event.clientX}px`;
        palettePopup.style.zIndex = '1000';
        palettePopup.style.display = 'grid';
        palettePopup.style.gridTemplateColumns = 'repeat(6, 1fr)'; // 6 kolumn w palecie
        palettePopup.style.gap = '3px';

        // Dodaj kolory do dymka
        colors.forEach(color => {
            const colorButton = document.createElement('div');
            colorButton.style.backgroundColor = color;
            colorButton.classList.add('w-10', 'h-10', 'rounded-full', 'cursor-pointer', 'border');
            colorButton.style.width = '20px'; // Szerokość koloru
            colorButton.style.height = '20px'; // Wysokość koloru
            colorButton.addEventListener('click', () => {
                placeDot(cell, row, col, color);
                palettePopup.remove();
            });
            palettePopup.appendChild(colorButton);
        });

        // Dodaj przycisk do usuwania koloru
        const clearButton = document.createElement('div');
        clearButton.textContent = 'Usuń';
        clearButton.classList.add('w-full', 'text-center', 'cursor-pointer', 'text-red-500', 'font-bold', 'mt-2');
        clearButton.addEventListener('click', () => {
            removeDot(cell, row, col);
            palettePopup.remove();
        });
        palettePopup.appendChild(clearButton);

        document.body.appendChild(palettePopup);

        // Usuń dymek, jeśli użytkownik kliknie poza nim
        document.addEventListener('click', (e) => {
            if (!palettePopup.contains(e.target as Node) && e.target !== cell) {
                palettePopup.remove();
            }
        }, { once: true });
    };

    const placeDot = (cell: HTMLElement, row: number, col: number, color: string) => {
        console.log('Placing dot:', { row, col, color });

        if (dots.filter(dot => dot.color === color).length >= 2) {
            alert('Każdy kolor może mieć tylko dwie kropki.');
            return;
        }

        if (dots.some(dot => dot.row === row && dot.col === col)) {
            alert('To pole jest już zajęte.');
            return;
        }

        dots.push({ row, col, color });

        // Usuń istniejące koło, jeśli jest
        const existingDot = cell.querySelector('.dot');
        if (existingDot) {
            existingDot.remove();
        }

        // Dodaj nowe koło
        const dotElement = document.createElement('div');
        dotElement.classList.add('dot');
        dotElement.style.backgroundColor = color;
        dotElement.style.width = '50%'; // Rozmiar koła jako procent wielkości kwadratu
        dotElement.style.height = '50%';
        dotElement.style.borderRadius = '50%'; // Sprawia, że element jest okrągły
        dotElement.style.position = 'absolute';
        dotElement.style.top = '25%'; // Wyśrodkowanie w pionie
        dotElement.style.left = '25%'; // Wyśrodkowanie w poziomie
        cell.appendChild(dotElement);

        dotsInput.value = JSON.stringify(dots);
    };

    const removeDot = (cell: HTMLElement, row: number, col: number) => {
        dots = dots.filter(dot => !(dot.row === row && dot.col === col));
        cell.style.backgroundColor = '';
        const existingDot = cell.querySelector('.dot');
        if (existingDot) {
            existingDot.remove();
        }
        dotsInput.value = JSON.stringify(dots);
    };

    // Obsługa zapisu planszy
    form.addEventListener('submit', async (event) => {
        console.log('Formularz został przesłany');
        event.preventDefault();

        const csrfTokenElement = document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement;
        if (!csrfTokenElement || !csrfTokenElement.value) {
            alert('Nie znaleziono tokenu CSRF. Odśwież stronę i spróbuj ponownie.');
            return;
        }

        const boardData = {
            name: nameInput.value.trim(),
            rows: parseInt(rowsInput.value) || 0,
            cols: parseInt(colsInput.value) || 0,
            dots: dots
        };

        console.log('Dane planszy do zapisania:', boardData);

        if (!boardData.name || boardData.rows <= 0 || boardData.cols <= 0) {
            alert('Upewnij się, że nazwa, liczba wierszy i kolumn są poprawnie wypełnione.');
            return;
        }

        try {
            const boardId = boardIdInput.value; // Pobierz wartość board_id
            const endpoint = boardId ? `/routes/edit_board/${boardId}/` : '/routes/create_board/';
            console.log('Wysyłanie żądania na endpoint:', endpoint);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfTokenElement.value
                },
                body: JSON.stringify(boardData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Błąd serwera:', errorData);
                alert(`Błąd podczas zapisywania: ${errorData.message || 'Nieznany błąd'}`);
                return;
            }

            const responseData = await response.json();
            console.log('Plansza została zapisana pomyślnie:', responseData);

            // Jeśli plansza została utworzona, zaktualizuj boardId i pozostaw użytkownika na stronie
            if (!boardId) {
                boardIdInput.value = responseData.board_id; // Zaktualizuj ukryte pole z board_id
                alert('Nowa plansza została utworzona!');
            } else {
                alert('Plansza została zaktualizowana!');
            }

            // Pozostań na stronie edycji
            console.log('Pozostajemy na stronie edycji planszy.');
        } catch (error) {
            console.error('Błąd podczas zapisywania planszy:', error);
            alert('Wystąpił błąd podczas zapisywania planszy.');
        }
    });

    rowsInput.addEventListener('input', generateGrid);
    colsInput.addEventListener('input', generateGrid);

    // Pobierz istniejące dane planszy z bazy danych
    try {
        console.log('Wartość dotsInput.value przed parsowaniem:', dotsInput.value);

        // Zamień pojedyncze cudzysłowy na podwójne, jeśli to konieczne
        const fixedDotsValue = dotsInput.value.replace(/'/g, '"');
        const existingDots = JSON.parse(fixedDotsValue || '[]');

        if (Array.isArray(existingDots)) {
            dots = existingDots;
        } else {
            console.error('Oczekiwano tablicy, ale otrzymano:', existingDots);
        }
    } catch (error) {
        console.error('Błąd podczas parsowania JSON z dotsInput.value:', dotsInput.value, error);
        dots = []; // Ustaw domyślną wartość, jeśli JSON jest niepoprawny
    }

    dotsInput.value = JSON.stringify(dots);
    generateGrid();
});