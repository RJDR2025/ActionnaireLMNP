<?php

namespace App\Controller\Api;

use App\Entity\Actionnaire;
use App\Entity\User;
use App\Repository\ActionnaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/actionnaire')]
class ActionnaireController extends AbstractController
{
    #[Route('/list', name: 'api_actionnaire_list', methods: ['GET'])]
    public function list(ActionnaireRepository $repository): JsonResponse
    {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $actionnaires = $repository->findAllOrderedByName();

        $data = array_map(function(Actionnaire $actionnaire) {
            return [
                'id' => $actionnaire->getId(),
                'nom' => $actionnaire->getNom(),
                'prenom' => $actionnaire->getPrenom(),
                'email' => $actionnaire->getEmail(),
                'nombreParts' => $actionnaire->getNombreParts(),
                'fullName' => $actionnaire->getFullName(),
            ];
        }, $actionnaires);

        return $this->json(['actionnaires' => $data]);
    }

    #[Route('/create', name: 'api_actionnaire_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        ActionnaireRepository $repository
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['nom']) || !isset($data['prenom']) || !isset($data['email']) || !isset($data['nombreParts'])) {
            return $this->json(['error' => 'Données manquantes (nom, prenom, email, nombreParts requis)'], Response::HTTP_BAD_REQUEST);
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Check if email already exists
        $existing = $entityManager->getRepository(Actionnaire::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return $this->json(['error' => 'Un actionnaire avec cet email existe déjà'], Response::HTTP_CONFLICT);
        }

        // Validate nombreParts
        $nombreParts = (int)$data['nombreParts'];
        if ($nombreParts <= 0) {
            return $this->json(['error' => 'Le nombre de parts doit être positif'], Response::HTTP_BAD_REQUEST);
        }

        $actionnaire = new Actionnaire();
        $actionnaire->setNom($data['nom']);
        $actionnaire->setPrenom($data['prenom']);
        $actionnaire->setEmail($data['email']);
        $actionnaire->setNombreParts($nombreParts);

        $entityManager->persist($actionnaire);
        $entityManager->flush();

        return $this->json([
            'message' => 'Actionnaire créé avec succès',
            'actionnaire' => [
                'id' => $actionnaire->getId(),
                'nom' => $actionnaire->getNom(),
                'prenom' => $actionnaire->getPrenom(),
                'email' => $actionnaire->getEmail(),
                'nombreParts' => $actionnaire->getNombreParts(),
                'fullName' => $actionnaire->getFullName(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}/update', name: 'api_actionnaire_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $actionnaire = $entityManager->getRepository(Actionnaire::class)->find($id);
        if (!$actionnaire) {
            return $this->json(['error' => 'Actionnaire non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['nom']) || !isset($data['prenom']) || !isset($data['email']) || !isset($data['nombreParts'])) {
            return $this->json(['error' => 'Données manquantes'], Response::HTTP_BAD_REQUEST);
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Check if email is already used by another actionnaire
        if ($data['email'] !== $actionnaire->getEmail()) {
            $existing = $entityManager->getRepository(Actionnaire::class)->findOneBy(['email' => $data['email']]);
            if ($existing) {
                return $this->json(['error' => 'Un actionnaire avec cet email existe déjà'], Response::HTTP_CONFLICT);
            }
        }

        // Validate nombreParts
        $nombreParts = (int)$data['nombreParts'];
        if ($nombreParts <= 0) {
            return $this->json(['error' => 'Le nombre de parts doit être positif'], Response::HTTP_BAD_REQUEST);
        }

        $actionnaire->setNom($data['nom']);
        $actionnaire->setPrenom($data['prenom']);
        $actionnaire->setEmail($data['email']);
        $actionnaire->setNombreParts($nombreParts);
        $actionnaire->setUpdatedAt(new \DateTime());

        $entityManager->flush();

        return $this->json([
            'message' => 'Actionnaire modifié avec succès',
            'actionnaire' => [
                'id' => $actionnaire->getId(),
                'nom' => $actionnaire->getNom(),
                'prenom' => $actionnaire->getPrenom(),
                'email' => $actionnaire->getEmail(),
                'nombreParts' => $actionnaire->getNombreParts(),
                'fullName' => $actionnaire->getFullName(),
            ]
        ]);
    }

    #[Route('/{id}/delete', name: 'api_actionnaire_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $currentUser = $this->getUser();

        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $actionnaire = $entityManager->getRepository(Actionnaire::class)->find($id);
        if (!$actionnaire) {
            return $this->json(['error' => 'Actionnaire non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($actionnaire);
        $entityManager->flush();

        return $this->json(['message' => 'Actionnaire supprimé avec succès']);
    }
}
