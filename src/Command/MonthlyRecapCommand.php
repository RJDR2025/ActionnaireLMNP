<?php

namespace App\Command;

use App\Repository\ActionnaireRepository;
use App\Repository\TimeEntryRepository;
use App\Repository\UserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AsCommand(
    name: 'app:monthly-recap',
    description: 'Génère une synthèse mensuelle des développements avec Claude',
)]
class MonthlyRecapCommand extends Command
{
    public function __construct(
        private TimeEntryRepository $timeEntryRepository,
        private UserRepository $userRepository,
        private ActionnaireRepository $actionnaireRepository,
        private HttpClientInterface $httpClient,
        private MailerInterface $mailer,
        private string $anthropicApiKey
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('email', null, InputOption::VALUE_OPTIONAL, 'Envoyer uniquement à cet email')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Simuler l\'envoi sans envoyer réellement');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Calculer les dates du mois précédent
        $lastMonth = new \DateTime('first day of last month');
        $lastMonthEnd = new \DateTime('last day of last month');

        $io->title(sprintf(
            'Génération du récapitulatif mensuel pour %s %s',
            $this->getMonthInFrench($lastMonth),
            $lastMonth->format('Y')
        ));

        // Récupérer toutes les entrées du mois précédent
        $timeEntries = $this->timeEntryRepository->createQueryBuilder('t')
            ->where('t.date >= :start')
            ->andWhere('t.date <= :end')
            ->setParameter('start', $lastMonth)
            ->setParameter('end', $lastMonthEnd)
            ->orderBy('t.app', 'ASC')
            ->addOrderBy('t.date', 'ASC')
            ->getQuery()
            ->getResult();

        if (empty($timeEntries)) {
            $io->warning('Aucune tâche trouvée pour le mois précédent.');
            return Command::SUCCESS;
        }

        $io->info(sprintf('%d entrées trouvées', count($timeEntries)));

        // Organiser les tâches par application
        $tasksByApp = [];
        $hoursByApp = [];

        foreach ($timeEntries as $entry) {
            $app = strtoupper($entry->getApp() ?? 'UNKNOWN');

            if (!isset($tasksByApp[$app])) {
                $tasksByApp[$app] = [];
                $hoursByApp[$app] = 0;
            }

            $hoursByApp[$app] += (float) $entry->getHours();

            foreach ($entry->getTasks() as $task) {
                $tasksByApp[$app][] = sprintf(
                    '[%s - %s] %s',
                    $entry->getDate()->format('d/m/Y'),
                    $entry->getUser()->getName(),
                    $task
                );
            }
        }

        // Préparer le prompt pour ChatGPT
        $prompt = $this->buildPrompt($tasksByApp, $hoursByApp, $lastMonth);

        $io->section('Génération de la synthèse avec Claude...');

        try {
            $synthesis = $this->generateSynthesis($prompt);

            $io->success('Synthèse générée avec succès !');
            $io->section('Synthèse mensuelle');
            $io->text($synthesis);

            // Envoyer l'email
            $targetEmail = $input->getOption('email');
            $dryRun = $input->getOption('dry-run');

            $this->sendRecapEmail($synthesis, $lastMonth, $io, $targetEmail, $dryRun);

            if ($dryRun) {
                $io->success('Simulation terminée (aucun email envoyé)');
            } else {
                $io->success('Email envoyé avec succès !');
            }

        } catch (\Exception $e) {
            $io->error('Erreur lors de la génération de la synthèse : ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function getMonthInFrench(\DateTime $date): string
    {
        $months = [
            1 => 'janvier',
            2 => 'février',
            3 => 'mars',
            4 => 'avril',
            5 => 'mai',
            6 => 'juin',
            7 => 'juillet',
            8 => 'août',
            9 => 'septembre',
            10 => 'octobre',
            11 => 'novembre',
            12 => 'décembre'
        ];

        return $months[(int) $date->format('n')];
    }

    private function buildPrompt(array $tasksByApp, array $hoursByApp, \DateTime $month): string
    {
        $prompt = sprintf(
            "Tu es un assistant qui génère des rapports mensuels de développement. Voici les tâches réalisées en %s %s :\n\n",
            $this->getMonthInFrench($month),
            $month->format('Y')
        );

        foreach ($tasksByApp as $app => $tasks) {
            $prompt .= sprintf("## Projet %s\n\n", $app);
            $prompt .= "Tâches réalisées :\n";
            foreach ($tasks as $task) {
                $prompt .= "- " . $task . "\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "\nGénère un rapport professionnel et SYNTHÉTIQUE en HTML. IMPORTANT : REGROUPE les tâches similaires ensemble !\n\n";
        $prompt .= "Le rapport doit avoir cette structure :\n\n";
        $prompt .= "1. UN TITRE H2 : 'Rapport de développement - [Mois] [Année]'\n\n";
        $prompt .= "2. UNE SECTION H3 : 'Réalisations du mois'\n";
        $prompt .= "   Pour CHAQUE projet, créer :\n";
        $prompt .= "   - Un sous-titre H4 avec le nom du projet\n";
        $prompt .= "   - Un tableau avec 1 colonne 'RÉALISATION' contenant des lignes REGROUPÉES par thème\n";
        $prompt .= "   - REGROUPE les tâches similaires en une seule ligne synthétique\n";
        $prompt .= "   - Exemple : au lieu de 10 lignes 'Gestion tickets support', fais UNE ligne 'Support client continu'\n";
        $prompt .= "   - Exemple : regroupe 'Page Accueil', 'Page Contact', 'Page Blog' en 'Développement des pages principales du site vitrine'\n";
        $prompt .= "   - Maximum 8-10 lignes par projet, pas plus !\n";
        $prompt .= "   - Ne pas inclure les dates, les noms des développeurs, ni les heures\n\n";
        $prompt .= "3. UNE SECTION H3 : 'Conclusion' avec un paragraphe de synthèse globale du mois\n";
        $prompt .= "   - Résume les avancées majeures\n";
        $prompt .= "   - Mentionne les points clés accomplis\n";
        $prompt .= "   - Donne une vision d'ensemble professionnelle\n\n";
        $prompt .= "RÈGLES STRICTES :\n";
        $prompt .= "- SYNTHÉTISE et REGROUPE, ne liste pas chaque tâche individuellement\n";
        $prompt .= "- NE MENTIONNE JAMAIS les heures ou le temps passé (ni dans les titres, ni dans la conclusion)\n";
        $prompt .= "- Ne mets AUCUN commentaire HTML\n";
        $prompt .= "- Ne mets PAS de balises markdown\n";
        $prompt .= "- Retourne UNIQUEMENT le HTML pur\n";
        $prompt .= "- Utilise des couleurs pour les en-têtes de tableau (background violet/bleu comme #667eea)\n";
        $prompt .= "Le rapport doit être clair, concis et adapté pour des actionnaires.";

        return $prompt;
    }

    private function generateSynthesis(string $prompt): string
    {
        $response = $this->httpClient->request('POST', 'https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key' => $this->anthropicApiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'claude-sonnet-4-20250514',
                'max_tokens' => 4000,
                'system' => 'Tu es un assistant spécialisé dans la rédaction de rapports de développement professionnels. Tu retournes uniquement du HTML pur sans balises markdown.',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
            ],
        ]);

        $data = $response->toArray();

        if (!isset($data['content'][0]['text'])) {
            throw new \Exception('Réponse invalide de l\'API Anthropic');
        }

        $html = $data['content'][0]['text'];

        // Nettoyer les balises markdown si présentes
        $html = preg_replace('/^```html\s*/i', '', $html);
        $html = preg_replace('/\s*```$/i', '', $html);
        $html = trim($html);

        return $html;
    }

    private function sendRecapEmail(string $synthesis, \DateTime $month, SymfonyStyle $io, ?string $targetEmail = null, bool $dryRun = false): void
    {
        // Déterminer les destinataires
        $recipients = [];

        if ($targetEmail) {
            // Envoyer uniquement à l'email spécifié
            $recipients[] = $targetEmail;
            $io->info(sprintf('Destinataire ciblé : %s', $targetEmail));
        } else {
            // Récupérer tous les actionnaires de la table actionnaire
            $actionnaires = $this->actionnaireRepository->findAll();

            if (empty($actionnaires)) {
                throw new \Exception('Aucun actionnaire trouvé pour l\'envoi de l\'email');
            }

            foreach ($actionnaires as $actionnaire) {
                $recipients[] = $actionnaire->getEmail();
            }
            $io->info(sprintf('%d destinataires trouvés', count($recipients)));
        }

        $monthName = ucfirst($this->getMonthInFrench($month));

        $htmlContent = sprintf('
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Récapitulatif mensuel - %s %s</title>
    <style>
        body {
            font-family: "Segoe UI", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a1a1a;
            border-bottom: 4px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 30px;
            font-size: 28px;
        }
        h2, h3 {
            color: #1a1a1a;
            margin-top: 40px;
            margin-bottom: 20px;
            font-size: 22px;
        }
        table {
            width: 100%%;
            border-collapse: collapse;
            margin: 25px 0;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        thead {
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
        }
        th {
            color: #000000;
            padding: 16px 20px;
            text-align: left;
            font-weight: 700;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 14px 20px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 15px;
            color: #374151;
        }
        tbody tr:hover {
            background-color: #f3f4f6;
            transition: background-color 0.2s;
        }
        tbody tr:last-child td {
            border-bottom: none;
        }
        p {
            font-size: 15px;
            line-height: 1.8;
            color: #4b5563;
        }
        .period {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
            font-weight: 500;
        }
        .footer {
            margin-top: 50px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
        }
        .bilan {
            background-color: #f9fafb;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Récapitulatif mensuel des développements</h1>
        <p class="period">Période : %s %s</p>

        %s

        <div class="footer">
            <p>Ce rapport a été généré automatiquement le %s</p>
            <p>© %s CheckHagnere - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
        ',
            $monthName,
            $month->format('Y'),
            $monthName,
            $month->format('Y'),
            $synthesis,
            (new \DateTime())->format('d/m/Y à H:i'),
            (new \DateTime())->format('Y')
        );

        $email = (new Email())
            ->from(new \Symfony\Component\Mime\Address('noreply@noreply.lmnp.ai', 'LMNP.AI'))
            ->subject(sprintf('📊 Récapitulatif mensuel - %s %s', $monthName, $month->format('Y')))
            ->html($htmlContent);

        // Ajouter les destinataires
        foreach ($recipients as $recipient) {
            $email->addTo($recipient);
        }

        if ($dryRun) {
            $io->section('Mode simulation - Aperçu de l\'email');
            $io->listing($recipients);
            $io->text('Sujet : ' . $email->getSubject());
            $io->section('Contenu HTML généré');
            $io->text($synthesis);
        } else {
            $this->mailer->send($email);
        }
    }
}
