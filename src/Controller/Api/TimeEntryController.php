<?php

namespace App\Controller\Api;

use App\Entity\TimeEntry;
use App\Entity\User;
use App\Repository\TimeEntryRepository;
use App\Repository\MonthlyHoursPlanningRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/time-entries')]
class TimeEntryController extends AbstractController
{
    #[Route('', name: 'api_time_entries_list', methods: ['GET'])]
    public function list(
        Request $request,
        TimeEntryRepository $repository,
        MonthlyHoursPlanningRepository $planningRepository
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $month = $request->query->getInt('month', (int)date('m'));
        $year = $request->query->getInt('year', (int)date('Y'));
        $app = $request->query->get('app'); // lmnp or sci

        $entries = $repository->findByUserAndMonth($user, $month, $year, $app);

        $data = array_map(function (TimeEntry $entry) {
            return [
                'id' => $entry->getId(),
                'hours' => $entry->getHours(),
                'date' => $entry->getDate()->format('Y-m-d'),
                'tasks' => $entry->getTasks(),
                'app' => $entry->getApp(),
                'createdAt' => $entry->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $entries);

        // Calculate total hours for the month
        $totalHours = array_reduce($entries, function ($sum, TimeEntry $entry) {
            return $sum + (float)$entry->getHours();
        }, 0);

        // Check if there's a custom planning for this month/year
        $planning = $planningRepository->findByUserMonthYear($user, $month, $year, $app);
        $currentMonthHours = $planning ? $planning->getHours() : $user->getMonthlyHours();

        return $this->json([
            'entries' => $data,
            'totalHours' => $totalHours,
            'monthlyHours' => (int)$currentMonthHours, // Current month hours (custom or default)
            'month' => $month,
            'year' => $year,
            'app' => $app,
        ]);
    }

    #[Route('/admin/all', name: 'api_time_entries_admin_list', methods: ['GET'])]
    public function adminList(
        Request $request,
        TimeEntryRepository $repository,
        MonthlyHoursPlanningRepository $planningRepository
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is admin
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json([
                'error' => 'Accès refusé. Rôle administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }

        $month = $request->query->getInt('month', (int)date('m'));
        $year = $request->query->getInt('year', (int)date('Y'));
        $app = $request->query->get('app'); // lmnp or sci

        // Fetch all entries for all users
        $entries = $repository->findAllByMonth($month, $year, $app);

        $data = array_map(function (TimeEntry $entry) use ($planningRepository, $month, $year, $app) {
            // Check if there's a custom planning for this month/year
            $planning = $planningRepository->findByUserMonthYear($entry->getUser(), $month, $year, $app);
            $currentMonthHours = $planning ? $planning->getHours() : $entry->getUser()->getMonthlyHours();

            return [
                'id' => $entry->getId(),
                'hours' => (int)$entry->getHours(),
                'date' => $entry->getDate()->format('Y-m-d'),
                'tasks' => $entry->getTasks(),
                'app' => $entry->getApp(),
                'createdAt' => $entry->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $entry->getUser()->getId(),
                    'email' => $entry->getUser()->getEmail(),
                    'name' => $entry->getUser()->getName() ?? $entry->getUser()->getEmail(),
                    'monthlyHours' => (int)$currentMonthHours, // Use current month hours (custom or default)
                ],
            ];
        }, $entries);

        // Calculate total hours for the month
        $totalHours = array_reduce($entries, function ($sum, TimeEntry $entry) {
            return $sum + (float)$entry->getHours();
        }, 0);

        return $this->json([
            'entries' => $data,
            'totalHours' => $totalHours,
            'month' => $month,
            'year' => $year,
            'app' => $app,
        ]);
    }

    #[Route('', name: 'api_time_entries_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        // Validation
        if (!isset($data['hours']) || !isset($data['date']) || !isset($data['tasks']) || !isset($data['app'])) {
            return $this->json([
                'error' => 'Données manquantes (hours, date, tasks, app requis)'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!is_numeric($data['hours']) || $data['hours'] <= 0) {
            return $this->json([
                'error' => 'Le nombre d\'heures doit être positif'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!is_array($data['tasks']) || empty($data['tasks'])) {
            return $this->json([
                'error' => 'Au moins une tâche est requise'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!in_array($data['app'], ['lmnp', 'sci'])) {
            return $this->json([
                'error' => 'Application invalide (lmnp ou sci requis)'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $date = new \DateTime($data['date']);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Format de date invalide'
            ], Response::HTTP_BAD_REQUEST);
        }

        $timeEntry = new TimeEntry();
        $timeEntry->setUser($user);
        $timeEntry->setHours($data['hours']);
        $timeEntry->setDate($date);
        $timeEntry->setTasks($data['tasks']);
        $timeEntry->setApp($data['app']);

        $entityManager->persist($timeEntry);
        $entityManager->flush();

        return $this->json([
            'message' => 'Entrée créée avec succès',
            'entry' => [
                'id' => $timeEntry->getId(),
                'hours' => $timeEntry->getHours(),
                'date' => $timeEntry->getDate()->format('Y-m-d'),
                'tasks' => $timeEntry->getTasks(),
                'app' => $timeEntry->getApp(),
                'createdAt' => $timeEntry->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_time_entries_delete', methods: ['DELETE'])]
    public function delete(
        TimeEntry $timeEntry,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Verify the entry belongs to the current user
        if ($timeEntry->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'error' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }

        $entityManager->remove($timeEntry);
        $entityManager->flush();

        return $this->json([
            'message' => 'Entrée supprimée avec succès'
        ]);
    }
}
