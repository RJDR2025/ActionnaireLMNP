<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\MonthlyHoursPlanningRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/user')]
class UserController extends AbstractController
{
    #[Route('/change-role', name: 'api_user_change_role', methods: ['POST'])]
    public function changeRole(
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

        if (!isset($data['role'])) {
            return $this->json([
                'error' => 'Rôle manquant'
            ], Response::HTTP_BAD_REQUEST);
        }

        $allowedRoles = ['ROLE_ADMIN', 'ROLE_ACTIONNAIRE', 'ROLE_DEV', 'ROLE_LMNP', 'ROLE_SCI'];
        $newRole = $data['role'];

        if (!in_array($newRole, $allowedRoles)) {
            return $this->json([
                'error' => 'Rôle invalide'
            ], Response::HTTP_BAD_REQUEST);
        }

        $user->setRoles([$newRole, 'ROLE_USER']);

        $entityManager->flush();

        return $this->json([
            'message' => 'Rôle changé avec succès',
            'role' => $newRole,
            'roles' => $user->getRoles()
        ]);
    }

    #[Route('/create', name: 'api_user_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is admin
        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json([
                'error' => 'Accès refusé. Rôle administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Validation
        if (!isset($data['email']) || !isset($data['name']) || !isset($data['roles'])) {
            return $this->json([
                'error' => 'Données manquantes (email, name, roles requis)'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validate roles
        if (!is_array($data['roles']) || empty($data['roles'])) {
            return $this->json([
                'error' => 'Au moins un rôle doit être sélectionné'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Default monthly hours
        $monthlyHours = isset($data['monthlyHours']) ? (int)$data['monthlyHours'] : 140;
        if ($monthlyHours <= 0) {
            return $this->json([
                'error' => 'Les heures mensuelles doivent être un nombre positif'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Check if email already exists
        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json([
                'error' => 'Un utilisateur avec cet email existe déjà'
            ], Response::HTTP_CONFLICT);
        }

        // Validate and map roles
        $roleMapping = [
            'admin' => 'ROLE_ADMIN',
            'actionnaire' => 'ROLE_ACTIONNAIRE',
            'lmnp' => 'ROLE_LMNP',
            'sci' => 'ROLE_SCI',
        ];

        $mappedRoles = [];
        foreach ($data['roles'] as $role) {
            if (!isset($roleMapping[$role])) {
                return $this->json([
                    'error' => "Rôle invalide: {$role}"
                ], Response::HTTP_BAD_REQUEST);
            }
            $mappedRoles[] = $roleMapping[$role];
        }

        // Generate secure password
        $password = $this->generateSecurePassword();

        // Create new user
        $newUser = new User();
        $newUser->setEmail($data['email']);
        $newUser->setName($data['name']);
        $newUser->setRoles(array_merge($mappedRoles, ['ROLE_USER']));
        $newUser->setMonthlyHours($monthlyHours);

        // Hash password
        $hashedPassword = $passwordHasher->hashPassword($newUser, $password);
        $newUser->setPassword($hashedPassword);

        $entityManager->persist($newUser);
        $entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id' => $newUser->getId(),
                'email' => $newUser->getEmail(),
                'name' => $newUser->getName(),
                'password' => $password, // Return plain password only once
                'roles' => $newUser->getRoles()
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}/update', name: 'api_user_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is admin
        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json([
                'error' => 'Accès refusé. Rôle administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Find the user to update
        $userToUpdate = $entityManager->getRepository(User::class)->find($id);
        if (!$userToUpdate) {
            return $this->json([
                'error' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Validation
        if (!isset($data['email']) || !isset($data['name']) || !isset($data['roles'])) {
            return $this->json([
                'error' => 'Données manquantes (email, name, roles requis)'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validate roles
        if (!is_array($data['roles']) || empty($data['roles'])) {
            return $this->json([
                'error' => 'Au moins un rôle doit être sélectionné'
            ], Response::HTTP_BAD_REQUEST);
        }

        $allowedRoles = ['ROLE_ADMIN', 'ROLE_ACTIONNAIRE', 'ROLE_DEV', 'ROLE_LMNP', 'ROLE_SCI'];
        foreach ($data['roles'] as $role) {
            if (!in_array($role, $allowedRoles)) {
                return $this->json([
                    'error' => "Rôle invalide: {$role}"
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Check if email is already used by another user
        if ($data['email'] !== $userToUpdate->getEmail()) {
            $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json([
                    'error' => 'Un utilisateur avec cet email existe déjà'
                ], Response::HTTP_CONFLICT);
            }
        }

        // Validate monthly hours
        $monthlyHours = isset($data['monthlyHours']) ? (int)$data['monthlyHours'] : $userToUpdate->getMonthlyHours();
        if ($monthlyHours <= 0) {
            return $this->json([
                'error' => 'Les heures mensuelles doivent être un nombre positif'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Update user
        $userToUpdate->setEmail($data['email']);
        $userToUpdate->setName($data['name']);
        $userToUpdate->setRoles(array_merge($data['roles'], ['ROLE_USER']));
        $userToUpdate->setMonthlyHours($monthlyHours);

        $entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur modifié avec succès',
            'user' => [
                'id' => $userToUpdate->getId(),
                'email' => $userToUpdate->getEmail(),
                'name' => $userToUpdate->getName(),
                'roles' => $userToUpdate->getRoles(),
                'monthlyHours' => $userToUpdate->getMonthlyHours()
            ]
        ]);
    }

    #[Route('/{id}/delete', name: 'api_user_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is admin
        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json([
                'error' => 'Accès refusé. Rôle administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Prevent self-deletion
        if ($currentUser->getId() === $id) {
            return $this->json([
                'error' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Find the user to delete
        $userToDelete = $entityManager->getRepository(User::class)->find($id);
        if (!$userToDelete) {
            return $this->json([
                'error' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($userToDelete);
        $entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    #[Route('/list', name: 'api_users_list', methods: ['GET'])]
    public function list(
        Request $request,
        EntityManagerInterface $entityManager,
        MonthlyHoursPlanningRepository $planningRepository
    ): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json([
                'error' => 'Non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user is admin
        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json([
                'error' => 'Accès refusé. Rôle administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }

        $users = $entityManager->getRepository(User::class)->findAll();

        // Get current month and year
        $currentMonth = (int)date('n');
        $currentYear = (int)date('Y');
        $app = $request->query->get('app', 'lmnp');

        $usersData = array_map(function(User $user) use ($planningRepository, $currentMonth, $currentYear, $app) {
            // Check if there's a custom planning for current month
            $planning = $planningRepository->findByUserMonthYear($user, $currentMonth, $currentYear, $app);

            $currentMonthHours = $planning ? $planning->getHours() : $user->getMonthlyHours();

            return [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'roles' => $user->getRoles(),
                'monthlyHours' => $user->getMonthlyHours(), // Default hours
                'currentMonthHours' => $currentMonthHours // Current month hours (custom or default)
            ];
        }, $users);

        return $this->json([
            'users' => $usersData
        ]);
    }

    private function generateSecurePassword(int $length = 16): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '!@#$%^&*()-_=+';

        $all = $uppercase . $lowercase . $numbers . $special;

        // Ensure at least one of each type
        $password = '';
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $special[random_int(0, strlen($special) - 1)];

        // Fill the rest randomly
        for ($i = 4; $i < $length; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        // Shuffle the password
        return str_shuffle($password);
    }
}
