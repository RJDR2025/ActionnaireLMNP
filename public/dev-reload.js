/**
 * Development auto-reload script
 * Polls a timestamp endpoint and reloads when files change
 */
(function() {
    if (!window.DEV_AUTO_RELOAD) return;

    let lastModified = null;
    const CHECK_INTERVAL = 1000; // Check every second

    async function checkForChanges() {
        try {
            const response = await fetch('/dev-check?' + Date.now(), {
                cache: 'no-cache'
            });
            const data = await response.json();

            if (lastModified === null) {
                lastModified = data.timestamp;
            } else if (data.timestamp !== lastModified) {
                console.log('🔄 Files changed, reloading...');
                location.reload();
            }
        } catch (e) {
            // Silently fail
        }
    }

    setInterval(checkForChanges, CHECK_INTERVAL);
    console.log('✨ Dev auto-reload enabled');
})();
