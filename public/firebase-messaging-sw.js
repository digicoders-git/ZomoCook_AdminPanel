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
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo.jpg'
    });
});
