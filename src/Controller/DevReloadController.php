<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class DevReloadController extends AbstractController
{
    #[Route('/dev-check', name: 'app_dev_check')]
    public function check(): JsonResponse
    {
        // Get the latest modification time from watched directories
        $dirs = [
            $this->getParameter('kernel.project_dir') . '/assets',
            $this->getParameter('kernel.project_dir') . '/templates',
            $this->getParameter('kernel.project_dir') . '/src',
        ];

        $latestTime = 0;

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) continue;

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($dir)
            );

            foreach ($iterator as $file) {
                if ($file->isFile() && !str_contains($file->getPathname(), '.git')) {
                    $latestTime = max($latestTime, $file->getMTime());
                }
            }
        }

        return new JsonResponse([
            'timestamp' => $latestTime,
        ]);
    }
}
