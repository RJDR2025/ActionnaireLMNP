<?php

namespace App\Command;

use App\Entity\TimeEntry;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import-devmazzitelli-time-entries',
    description: 'Import time entries for DevMazzitelli@gmail.com for November 2025',
)]
class ImportDevMazzitelliTimeEntriesCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;

    public function __construct(EntityManagerInterface $entityManager, UserRepository $userRepository)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Find user
        $user = $this->userRepository->findOneBy(['email' => 'DevMazzitelli@gmail.com']);

        if (!$user) {
            $io->error('User DevMazzitelli@gmail.com not found!');
            return Command::FAILURE;
        }

        $io->success(sprintf('Found user: %s', $user->getEmail()));

        // Data for November 2025 - Total: 158h
        $timeEntries = [
            // Semaine 1: Conversion dashboard admin en flux avec design Shadcn
            [
                'date' => '2025-11-03',
                'hours' => 7,
                'tasks' => [
                    'Dashboard admin - Conversion en flux avec design Shadcn - Analyse et mise en place',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-04',
                'hours' => 7,
                'tasks' => [
                    'Dashboard admin - Conversion en flux avec design Shadcn - Intégration composants UI',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-05',
                'hours' => 7,
                'tasks' => [
                    'Dashboard admin - Conversion en flux avec design Shadcn - Pages principales et finalisation',
                    'Gestion des tickets support client',
                ],
            ],
            // Semaine 2: Site vitrine - Pages front
            [
                'date' => '2025-11-10',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Pages Accueil et Blogs',
                    'Site vitrine - Header et Footer communs',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-11',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Page Articles blogs',
                    'Site vitrine - Page Contact',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-12',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Pages Connexion et Inscription',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-13',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Page Simulateur',
                    'Site vitrine - Page Notre-plateforme',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-14',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Page Services expert-comptable',
                    'Référencement naturel (SEO)',
                    'Gestion des tickets support client',
                ],
            ],
            // Semaine 3: Suite site vitrine et optimisations
            [
                'date' => '2025-11-17',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Optimisations et corrections responsive',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-18',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Intégration finale des pages',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-19',
                'hours' => 8,
                'tasks' => [
                    'Dashboard admin - Corrections et améliorations Shadcn',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-20',
                'hours' => 8,
                'tasks' => [
                    'Dashboard admin - Tests et optimisations flux',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-21',
                'hours' => 8,
                'tasks' => [
                    'Site vitrine - Finalisation référencement naturel (SEO)',
                    'Gestion des tickets support client',
                ],
            ],
            // Week-end 2 (samedi)
            [
                'date' => '2025-11-22',
                'hours' => 7,
                'tasks' => [
                    'Site vitrine et Dashboard - Corrections bugs et ajustements',
                    'Gestion des tickets support urgents',
                ],
            ],
            // Semaine 4: Application actionnaires.lmnp.ai (15h sur 3 jours)
            [
                'date' => '2025-11-24',
                'hours' => 8,
                'tasks' => [
                    'Application actionnaires.lmnp.ai - Mise en place de l\'architecture et configuration',
                    'Développement du système d\'envoi de récap aux actionnaires',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-25',
                'hours' => 8,
                'tasks' => [
                    'Application actionnaires.lmnp.ai - Développement de l\'interface de saisie des horaires développeurs',
                    'Intégration du dashboard actionnaires',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-26',
                'hours' => 8,
                'tasks' => [
                    'Application actionnaires.lmnp.ai - Tests, corrections et déploiement',
                    'Gestion des tickets support client',
                ],
            ],
            // Fin novembre: Vérification IA
            [
                'date' => '2025-11-28',
                'hours' => 10,
                'tasks' => [
                    'Vérification IA - Tests et validation',
                ],
            ],
            [
                'date' => '2025-11-29',
                'hours' => 10,
                'tasks' => [
                    'Vérification IA - Tests et validation',
                ],
            ],
            [
                'date' => '2025-11-30',
                'hours' => 6,
                'tasks' => [
                    'Vérification IA - Tests et validation',
                ],
            ],
        ];

        $io->info(sprintf('Importing %d time entries...', count($timeEntries)));

        $totalHours = 0;
        $count = 0;
        foreach ($timeEntries as $entryData) {
            $timeEntry = new TimeEntry();
            $timeEntry->setUser($user);
            $timeEntry->setDate(new \DateTime($entryData['date']));
            $timeEntry->setHours((string) $entryData['hours']);
            $timeEntry->setTasks($entryData['tasks']);
            $timeEntry->setApp('lmnp');

            $this->entityManager->persist($timeEntry);
            $count++;
            $totalHours += $entryData['hours'];

            $io->writeln(sprintf(
                '  [%s] %sh - %d tasks',
                $entryData['date'],
                $entryData['hours'],
                count($entryData['tasks'])
            ));
        }

        $this->entityManager->flush();

        $io->success(sprintf('Successfully imported %d time entries for November 2025!', $count));
        $io->info(sprintf('Total hours: %.0fh', $totalHours));

        return Command::SUCCESS;
    }
}
