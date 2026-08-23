const CACHE_NAME = "egor-melnikoff-v2";

const APP_FILES = [
    "/",
    "/index.html",
    "/manifest.json"
];


// ============================================
// Установка Service Worker
// ============================================

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );

    // Сразу активируем новую версию
    self.skipWaiting();
});


// ============================================
// Активация новой версии
// ============================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))

            );

        })

    );

    // Новый Service Worker сразу начинает
    // контролировать открытые страницы
    self.clients.claim();
});


// ============================================
// Обработка запросов
// ============================================

self.addEventListener("fetch", event => {

    // Работаем только с GET
    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

                // Если сервер ответил нормально —
                // сохраняем свежую версию в cache

                if (response && response.status === 200) {

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });

                }

                // Возвращаем свежий ответ
                return response;
            })

            .catch(() => {

                // Если интернета нет —
                // пытаемся взять старую версию

                return caches.match(event.request);

            })

    );

});
