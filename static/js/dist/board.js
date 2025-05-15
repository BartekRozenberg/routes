document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const dotsInput = document.getElementById('dots-input');
    const rowsInput = document.querySelector('input[name="rows"]');
    const colsInput = document.querySelector('input[name="cols"]');
    let dots = [];
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
                cell.style.aspectRatio = '1 / 1';
                gridContainer.appendChild(cell);
                // Obsługa kliknięcia na komórkę
                cell.addEventListener('click', (event) => {
                    showColorPalette(event, cell, r, c);
                });
            }
        }
    };
    // Funkcja do wyświetlania palety kolorów w dymku
    const showColorPalette = (event, cell, row, col) => {
        // Usuń istniejący dymek, jeśli jest
        const existingPalette = document.getElementById('color-palette-popup');
        if (existingPalette)
            existingPalette.remove();
        // Stwórz dymek z paletą kolorów
        const palettePopup = document.createElement('div');
        palettePopup.id = 'color-palette-popup';
        palettePopup.classList.add('absolute', 'bg-white', 'border', 'rounded-lg', 'p-2', 'shadow-lg');
        palettePopup.style.position = 'absolute';
        palettePopup.style.top = `${event.clientY + 100}px`;
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
            if (!palettePopup.contains(e.target) && e.target !== cell) {
                palettePopup.remove();
            }
        }, { once: true });
    };
    // Funkcja do umieszczania kropki na siatce
    const placeDot = (cell, row, col, color) => {
        if (dots.filter(dot => dot.color === color).length >= 2) {
            alert('Każdy kolor może mieć tylko dwie kropki.');
            return;
        }
        if (dots.some(dot => dot.row === row && dot.col === col)) {
            alert('To pole jest już zajęte.');
            return;
        }
        dots.push({ row, col, color });
        cell.style.backgroundColor = color;
        dotsInput.value = JSON.stringify(dots);
    };
    // Funkcja do usuwania kropki z siatki
    const removeDot = (cell, row, col) => {
        dots = dots.filter(dot => !(dot.row === row && dot.col === col));
        cell.style.backgroundColor = ''; // Usuń kolor z komórki
        dotsInput.value = JSON.stringify(dots);
    };
    rowsInput.addEventListener('input', generateGrid);
    colsInput.addEventListener('input', generateGrid);
    generateGrid(); // Wygeneruj siatkę na początku
});
//# sourceMappingURL=board.js.map