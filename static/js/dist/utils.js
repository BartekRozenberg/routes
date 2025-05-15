document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('route-canvas');
    const img = document.getElementById('route-image');
    const inputX = document.getElementById('id_x');
    const inputY = document.getElementById('id_y');
    const points = document.querySelectorAll('[data-x][data-y]'); // Punkty z atrybutami data-x i data-y
    const feedbackId = 'point-feedback'; // Identyfikator wizualnego wskaźnika
    if (!canvas || !img || !inputX || !inputY) {
        console.error('Required elements not found in the DOM.');
        return;
    }
    // Dopasowanie wymiarów canvasu do obrazu
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;
    // Funkcja tworząca wizualny wskaźnik
    const createFeedback = (x, y) => {
        var _a;
        // Usuń istniejący wskaźnik
        const existingFeedback = document.getElementById(feedbackId);
        if (existingFeedback) {
            existingFeedback.remove();
        }
        // Stwórz nowy wskaźnik
        const feedback = document.createElement('div');
        feedback.id = feedbackId;
        feedback.style.position = 'absolute';
        feedback.style.width = '16px';
        feedback.style.height = '16px';
        feedback.style.backgroundColor = 'blue';
        feedback.style.borderRadius = '50%';
        feedback.style.left = `${x - 8}px`; // Wyśrodkowanie wskaźnika
        feedback.style.top = `${y - 8}px`;
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '1000';
        (_a = canvas.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(feedback);
    };
    // Obsługa kliknięcia na canvas
    canvas.addEventListener('click', (event) => {
        var _a;
        const rect = canvas.getBoundingClientRect();
        // Oblicz współrzędne kliknięcia względem obrazu
        const x = Math.round((event.clientX - rect.left) / scaleX);
        const y = Math.round((event.clientY - rect.top) / scaleY);
        // Aktualizacja wartości pól formularza
        inputX.value = x.toString();
        inputY.value = y.toString();
        // Opcjonalny wizualny feedback
        const feedback = document.createElement('div');
        feedback.style.position = 'absolute';
        feedback.style.width = '10px';
        feedback.style.height = '10px';
        feedback.style.backgroundColor = 'red';
        feedback.style.borderRadius = '50%';
        feedback.style.left = `${event.clientX - rect.left - 5}px`;
        feedback.style.top = `${event.clientY - rect.top - 5}px`;
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '1000';
        (_a = canvas.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(feedback);
        // Usuń feedback po krótkim czasie
        setTimeout(() => {
            feedback.remove();
        }, 500);
    });
    // Dodaj event listenery do punktów
    points.forEach((point) => {
        point.addEventListener('mouseover', (event) => {
            const target = event.currentTarget;
            const dataX = parseFloat(target.getAttribute('data-x') || '0');
            const dataY = parseFloat(target.getAttribute('data-y') || '0');
            // Pobierz wymiary canvasu
            const rect = canvas.getBoundingClientRect();
            // Przelicz współrzędne na pozycję względem canvasu
            console.log('dataX:', dataX, 'dataY:', dataY);
            const x = dataX * scaleX;
            const y = dataY * scaleY;
            // Wyświetl wskaźnik
            createFeedback(x, y);
        });
        point.addEventListener('mouseout', () => {
            // Usuń wskaźnik po najechaniu myszką poza punkt
            const existingFeedback = document.getElementById(feedbackId);
            if (existingFeedback) {
                existingFeedback.remove();
            }
        });
    });
});
//# sourceMappingURL=utils.js.map