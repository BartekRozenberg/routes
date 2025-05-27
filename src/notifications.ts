const showNotification = (message: string, isError: boolean = false) => {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'fixed', 'bottom-4', 'right-4', 'p-4', 'rounded-lg', 'shadow-lg');
    notification.style.backgroundColor = isError ? '#DC2626' : '#16A34A'; // Czerwony dla błędów, zielony dla sukcesów
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.5s ease';
    notification.style.opacity = '1';

    notification.textContent = message;

    document.body.appendChild(notification);

    // Usuń powiadomienie po 5 sekundach
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing SSE connection...');
    const eventSource = new EventSource('/sse/notifications/');
    let isConnectionOpen = false; // Flaga monitorująca stan połączenia

    // Obsługa otwarcia połączenia
    eventSource.onopen = () => {
        console.log('SSE connection established.');
        isConnectionOpen = true; // Połączenie zostało nawiązane
    };

    // Obsługa błędów połączenia
    eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        if (isConnectionOpen) {
            // Wyświetl powiadomienie tylko, jeśli połączenie było wcześniej otwarte
            showNotification('Błąd połączenia z serwerem powiadomień.', true);
        }
        isConnectionOpen = false; // Połączenie zostało zamknięte
    };

    // Obsługa zdarzenia `newBoard`
    eventSource.addEventListener('newBoard', (event) => {
        const data = JSON.parse(event.data);
        console.log('Received newBoard event:', data);
        showNotification(`Użytkownik ${data.creator_username} utworzył nową planszę: ${data.board_name}.`);
    });

    // Obsługa zdarzenia `newPath`
    eventSource.addEventListener('newPath', (event) => {
        const data = JSON.parse(event.data);
        console.log('Received newPath event:', data);
        showNotification(`Użytkownik ${data.user_username} stworzył ścieżkę na planszy: ${data.board_name}.`);
    });
});