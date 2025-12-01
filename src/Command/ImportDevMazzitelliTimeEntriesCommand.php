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
            // Semaine 1: Refonte design dashboard admin
            [
                'date' => '2025-11-03',
                'hours' => 8,
                'tasks' => [
                    'Refonte design dashboard admin - Analyse de l\'existant et maquettage',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-04',
                'hours' => 8,
                'tasks' => [
                    'Refonte design dashboard admin - Mise en place des nouveaux composants UI',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-05',
                'hours' => 8,
                'tasks' => [
                    'Refonte design dashboard admin - Intégration des pages principales',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-06',
                'hours' => 8,
                'tasks' => [
                    'Refonte design dashboard admin - Pages de gestion utilisateurs',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-07',
                'hours' => 8,
                'tasks' => [
                    'Refonte design dashboard admin - Finalisation et corrections responsive',
                    'Gestion des tickets support client',
                ],
            ],
            // Week-end 1 (samedi)
            [
                'date' => '2025-11-08',
                'hours' => 7,
                'tasks' => [
                    'Refonte design dashboard admin - Corrections bugs et ajustements',
                    'Gestion des tickets support urgents',
                ],
            ],
            // Semaine 2: Refonte design site vitrine
            [
                'date' => '2025-11-10',
                'hours' => 8,
                'tasks' => [
                    'Refonte design site vitrine - Analyse et maquettage nouvelle charte graphique',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-11',
                'hours' => 8,
                'tasks' => [
                    'Refonte design site vitrine - Page d\'accueil et navigation',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-12',
                'hours' => 8,
                'tasks' => [
                    'Refonte design site vitrine - Pages de présentation des offres',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-13',
                'hours' => 8,
                'tasks' => [
                    'Refonte design site vitrine - Pages FAQ et contact',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-14',
                'hours' => 8,
                'tasks' => [
                    'Refonte design site vitrine - Responsive et optimisations',
                    'Gestion des tickets support client',
                ],
            ],
            // Semaine 3: Vérifications par IA
            [
                'date' => '2025-11-17',
                'hours' => 8,
                'tasks' => [
                    'Vérifications par IA - Analyse des problèmes avec les justificatifs volumineux',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-18',
                'hours' => 8,
                'tasks' => [
                    'Vérifications par IA - Refonte de la logique de traitement pour recettes/charges',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-19',
                'hours' => 8,
                'tasks' => [
                    'Vérifications par IA - Adaptation du code pour gérer les cas avec trop de justificatifs',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-20',
                'hours' => 8,
                'tasks' => [
                    'Vérifications par IA - Tests et corrections des edge cases',
                    'Gestion des tickets support client',
                ],
            ],
            [
                'date' => '2025-11-21',
                'hours' => 8,
                'tasks' => [
                    'Vérifications par IA - Finalisation et déploiement des corrections',
                    'Gestion des tickets support client',
                ],
            ],
            // Week-end 2 (samedi)
            [
                'date' => '2025-11-22',
                'hours' => 7,
                'tasks' => [
                    'Vérifications par IA - Monitoring et corrections post-déploiement',
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
