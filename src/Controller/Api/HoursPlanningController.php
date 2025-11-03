<?php

namespace App\Controller\Api;

use App\Entity\MonthlyHoursPlanning;
use App\Entity\User;
use App\Repository\MonthlyHoursPlanningRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/hours-planning')]
class HoursPlanningController extends AbstractController
{
    #[Route('/user/{userId}/year/{year}', name: 'api_hours_planning_get', methods: ['GET'])]
    public function getUserYearPlanning(
        int $userId,
        int $year,
        Request $request,
        EntityManagerInterface $entityManager,
        MonthlyHoursPlanningRepository $repository
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $app = $request->query->get('app', 'lmnp');

        // Get all plannings for this user/year/app
        $plannings = $repository->createQueryBuilder('p')
            ->andWhere('p.user = :user')
            ->andWhere('p.year = :year')
            ->andWhere('p.app = :app')
            ->setParameter('user', $user)
            ->setParameter('year', $year)
            ->setParameter('app', $app)
            ->getQuery()
            ->getResult();

        // Create array with all 12 months
        $monthsData = [];
        $planningByMonth = [];

        foreach ($plannings as $planning) {
            $planningByMonth[$planning->getMonth()] = $planning->getHours();
        }

        for ($month = 1; $month <= 12; $month++) {
            $monthsData[] = [
                'month' => $month,
                'hours' => $planningByMonth[$month] ?? $user->getMonthlyHours(),
                'isCustom' => isset($planningByMonth[$month]),
            ];
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'defaultMonthlyHours' => $user->getMonthlyHours(),
            ],
            'year' => $year,
            'app' => $app,
            'months' => $monthsData,
        ]);
    }

    #[Route('/user/{userId}/month', name: 'api_hours_planning_update', methods: ['POST'])]
    public function updateMonthPlanning(
        int $userId,
        Request $request,
        EntityManagerInterface $entityManager,
        MonthlyHoursPlanningRepository $repository
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['month']) || !isset($data['year']) || !isset($data['hours']) || !isset($data['app'])) {
            return $this->json(['error' => 'Données manquantes'], Response::HTTP_BAD_REQUEST);
        }

        $month = (int)$data['month'];
        $year = (int)$data['year'];
        $hours = (int)$data['hours'];
        $app = $data['app'];

        if ($month < 1 || $month > 12) {
            return $this->json(['error' => 'Mois invalide'], Response::HTTP_BAD_REQUEST);
        }

        if ($hours <= 0) {
            return $this->json(['error' => 'Les heures doivent être positives'], Response::HTTP_BAD_REQUEST);
        }

        // Find or create planning
        $planning = $repository->findByUserMonthYear($user, $month, $year, $app);

        if (!$planning) {
            $planning = new MonthlyHoursPlanning();
            $planning->setUser($user);
            $planning->setMonth($month);
            $planning->setYear($year);
            $planning->setApp($app);
        }

        $planning->setHours($hours);
        $planning->setUpdatedAt(new \DateTime());

        $entityManager->persist($planning);
        $entityManager->flush();

        return $this->json([
            'message' => 'Planification mise à jour',
            'planning' => [
                'month' => $planning->getMonth(),
                'year' => $planning->getYear(),
                'hours' => $planning->getHours(),
                'app' => $planning->getApp(),
            ]
        ]);
    }

    #[Route('/user/{userId}/month/{month}/year/{year}', name: 'api_hours_planning_reset', methods: ['DELETE'])]
    public function resetMonthPlanning(
        int $userId,
        int $month,
        int $year,
        Request $request,
        EntityManagerInterface $entityManager,
        MonthlyHoursPlanningRepository $repository
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $app = $request->query->get('app', 'lmnp');

        $planning = $repository->findByUserMonthYear($user, $month, $year, $app);

        if ($planning) {
            $entityManager->remove($planning);
            $entityManager->flush();
        }

        return $this->json([
            'message' => 'Planification réinitialisée',
            'defaultHours' => $user->getMonthlyHours(),
        ]);
    }
}
