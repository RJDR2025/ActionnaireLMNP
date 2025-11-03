<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Créer l'utilisateur admin
        $admin = new User();
        $admin->setEmail('quentin@hagnere-patrimoine.fr');
        $admin->setName('Quentin Hagnere');
        $admin->setRoles(['ROLE_ADMIN', 'ROLE_LMNP', 'ROLE_SCI']);

        // Hacher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword(
            $admin,
            '7Ls%k_0luFrgH^Fp'
        );
        $admin->setPassword($hashedPassword);

        // Définir les heures mensuelles par défaut
        $admin->setMonthlyHours(140);

        $manager->persist($admin);

        $manager->flush();
    }
}
