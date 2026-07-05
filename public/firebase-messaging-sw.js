importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
    authDomain: "collegepanel-1027b.firebaseapp.com",
    projectId: "collegepanel-1027b",
    storageBucket: "collegepanel-1027b.firebasestorage.app",
    messagingSenderId: "335340683871",
    appId: "1:335340683871:web:fb61de4457efc2ae5bd1ea"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png',
        data: payload.data // Pass the data payload to the notification event
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;
    let urlToOpen = '/';

    if (data) {
        if (data.actionUrl && data.actionUrl !== '/') {
            urlToOpen = data.actionUrl;
        } else if (data.notificationType) {
            // Fallback routing based on notificationType
            const type = data.notificationType.toLowerCase();
            if (type.includes('job') || type.includes('applied')) {
                urlToOpen = '/jobs';
            } else if (type.includes('candidate') || type.includes('cook')) {
                urlToOpen = '/candidates';
            } else if (type.includes('user') || type.includes('customer')) {
                urlToOpen = '/customers';
            } else if (type.includes('query')) {
                urlToOpen = '/queries';
            } else if (type.includes('payment') || type.includes('plan')) {
                urlToOpen = '/plans';
            }
        }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // Focus the first available client and navigate it to urlToOpen
                if ('focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
