<?php
/**
 * Simple file watcher for development
 * Run: php watch.php
 */

$watchDirs = [
    __DIR__ . '/assets',
    __DIR__ . '/templates',
    __DIR__ . '/src',
];

$lastHash = '';

echo "🔍 Watching for file changes...\n";
echo "Press Ctrl+C to stop.\n\n";

while (true) {
    $files = [];

    foreach ($watchDirs as $dir) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && !str_contains($file->getPathname(), '.git')) {
                $files[] = $file->getPathname() . ':' . $file->getMTime();
            }
        }
    }

    $currentHash = md5(implode('', $files));

    if ($lastHash && $lastHash !== $currentHash) {
        echo "✅ Files changed! Clear cache...\n";
        exec('php bin/console cache:clear');
        echo "✨ Done! Refresh your browser (F5)\n\n";
    }

    $lastHash = $currentHash;
    sleep(1);
}
