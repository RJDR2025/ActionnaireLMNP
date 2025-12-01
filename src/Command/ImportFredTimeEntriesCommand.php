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
    name: 'app:import-fred-time-entries',
    description: 'Import time entries for frederic.curinckx@gmail.com for 2025 (Sept-Nov)',
)]
class ImportFredTimeEntriesCommand extends Command
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
        $user = $this->userRepository->findOneBy(['email' => 'frederic.curinckx@gmail.com']);

        if (!$user) {
            $io->error('User frederic.curinckx@gmail.com not found!');
            return Command::FAILURE;
        }

        $io->success(sprintf('Found user: %s', $user->getEmail()));

        // Data for Sept-Nov 2025
        $timeEntries = [
            // September 2025
            [
                'date' => '2025-09-25',
                'hours' => 8,
                'tasks' => [
                    'Mise en place et sécurisation des accès (GitHub, transfert de propriété, compte e-mailing)',
                    'Analyse du code existant et correction d\'un bug d\'affichage d\'erreur à la connexion',
                    'Identification de points d\'optimisation potentiels dans la gestion des charges',
                    'Nettoyage et rationalisation des branches Git',
                    'Remise en état de l\'environnement de staging (SSL, DNS, désindexation) et configuration des services de test (e-mails, Stripe)',
                ],
            ],
            [
                'date' => '2025-09-26',
                'hours' => 8,
                'tasks' => [
                    'Relevé de problèmes fonctionnels (synchronisation des informations personnelles, correction d\'une faute d\'orthographe)',
                    'Déblocage de la route de paiement sur l\'environnement de test et intégration avec la signature électronique',
                    'Résolution de conflits Git et campagne de tests fonctionnels',
                    'Ajout des documents signés dans l\'espace "Mes documents" et renforcement des protections d\'accès (téléchargement limité à l\'utilisateur)',
                    'Création de comptes de test et rédaction des consignes de test',
                    'Préparation de documents vierges/complétés et remontée des problèmes observés sur le site',
                ],
            ],
            [
                'date' => '2025-09-29',
                'hours' => 8,
                'tasks' => [
                    'Analyse et résolution d\'un bug sur le nom/prénom exploitant à l\'inscription (lié aux données de test)',
                    'Correction d\'une faute d\'orthographe',
                    'Réorganisation de l\'espace de travail (Discord) pour clarifier le suivi des tâches',
                    'Préparation des éléments nécessaires à la connexion Apple',
                    'Conception et développement d\'un système de backups applicatifs (avec reporting)',
                    'Connexion des backups à un canal de monitoring',
                    'Mise en place de l\'envoi des backups vers un second serveur',
                    'Aide à la mise en place d\'un environnement de test complet pour la signature électronique',
                    'Recherche d\'améliorations du parcours utilisateur (navigation automatique entre étapes, comportements selon édition/répétition)',
                ],
            ],
            [
                'date' => '2025-09-30',
                'hours' => 8,
                'tasks' => [
                    'Installation et configuration de Claude 4.5 dans l\'environnement de développement',
                    'Mise en place de la navigation automatique entre étapes (pages uniques vs répétitives)',
                    'Lecture et analyse des résolutions de tickets pour améliorer la compréhension globale de l\'outil',
                    'Mise en place de l\'environnement de test Télédec sur staging',
                    'Investigation d\'un problème d\'affichage de la télétransmission',
                    'Point d\'avancement avec la direction produit',
                    'Correction de l\'affichage du bouton de soumission de liasse (zone télédéclaration) et clôture des tickets liés',
                ],
            ],
            // October 2025
            [
                'date' => '2025-10-01',
                'hours' => 8,
                'tasks' => [
                    'Mise en place d\'une protection contre le double clic sur les formulaires (désactivation/ré-activation des boutons + loader)',
                    'Support technique auprès de plusieurs clients',
                    'Recherche et choix d\'une solution de stockage de backups externe',
                    'Développement d\'une fonctionnalité permettant aux administrateurs de modifier l\'offre d\'un utilisateur après paiement (prise en compte des effets de bord)',
                    'Revue de code d\'une PR existante pour l\'intégrer à cette nouvelle fonctionnalité',
                    'Travail de sécurisation sur la barre de navigation latérale (droits d\'accès et sections verrouillées)',
                ],
            ],
            [
                'date' => '2025-10-02',
                'hours' => 8,
                'tasks' => [
                    'Avancement sur la barre latérale de navigation (pré-requis pour le changement d\'offre admin)',
                    'Réunion interne de cadrage fonctionnel et aide au déploiement',
                    'Finalisation du changement d\'offre côté admin, ajustement restant sur la barre de navigation',
                    'Revue, fusion et déploiement de PR sur la production, puis tests associés',
                    'Remise en place de la zone "date de naissance" dans les documents',
                    'Support fonctionnel sur tickets en cours',
                ],
            ],
            [
                'date' => '2025-10-03',
                'hours' => 8,
                'tasks' => [
                    'Rétablissement de la zone "Exploitant" et adaptation du PDF (suppression de champs non utilisés, repositionnement)',
                    'Synchronisation des branches main et staging',
                    'Ajout de l\'affichage/masquage des mots de passe sur l\'ensemble du parcours',
                    'Correctifs sur les règles de navigation entre étapes',
                    'Poursuite de la refonte de la navigation latérale et intégration du changement d\'offre user',
                    'Préparation et déploiement des backups distants, plus assistance ponctuelle à l\'équipe',
                    'Correction de la gestion des erreurs sur le formulaire d\'inscription (affichage des validations côté utilisateur)',
                ],
            ],
            [
                'date' => '2025-10-06',
                'hours' => 8,
                'tasks' => [
                    'Vérification de l\'exécution des backups et ajustement de la stratégie (augmentation stockage distant, suppression du backup local trop volumineux)',
                    'Point interne sur les erreurs d\'inscription et déploiement du correctif en production',
                    'Correction du bouton logout sur le site vitrine et mise à jour des branches Git',
                    'Support à l\'onboarding (API, explications)',
                    'Ajustements sur la barre latérale et sur la fonctionnalité de changement d\'offre (historisation des modifications)',
                    'Préparation d\'un nouvel e-mail lié au paiement d\'offre en reprise',
                    'Prise en charge des anciennes signatures SMS pour l\'année courante',
                ],
            ],
            [
                'date' => '2025-10-07',
                'hours' => 7,
                'tasks' => [
                    'Reprise de la validation via ancienne lettre de mission et découverte d\'une faille critique dans la configuration Git (prévention du risque)',
                    'Finalisation de la fonctionnalité de validation des anciennes lettres de mission et soumission en revue',
                    'Points d\'avancement internes et aide',
                    'Correction d\'une modale de vérification des informations personnelles pour les comptes liés à un fournisseur d\'identité externe',
                    'Accompagnement (analyse de code, fichiers partagés, correction d\'erreurs)',
                    'En soirée : préparation et déploiement d\'un correctif urgent lié à la reprise de comptabilité (éviter de refaire signer certains clients), déploiement en production et mise en place d\'une nouvelle procédure de revue obligatoire avant mise en prod',
                ],
            ],
            [
                'date' => '2025-10-08',
                'hours' => 8,
                'tasks' => [
                    'Centralisation des questions techniques sur la reprise de comptabilité et demande de documentation auprès de Teledec',
                    'Étude de plusieurs approches techniques pour la refonte de la zone "Reprise de comptabilité" (sous-domaine, Blade, Livewire)',
                    'Prise de contact avec Teledec pour obtenir la documentation nécessaire',
                    'Démarrage du développement de la nouvelle solution de reprise (front + flux de parcours)',
                    'Présentation d\'un MVP front, validation de la direction sur la marche à suivre (avec prise en compte du nombre de biens)',
                ],
            ],
            [
                'date' => '2025-10-09',
                'hours' => 8.5,
                'tasks' => [
                    'Avancement sur la nouvelle reprise (stabilisation des étapes, contraintes techniques, refonte de la gestion des biens)',
                    'Poursuite de la refonte l\'après-midi',
                    'Réunion de priorisation des sujets en cours et retours sur certaines zones (ex. avis externes)',
                    'Support client ponctuel (problème de template mail, passage en "payé" via virement)',
                    'Réunion produit et technique pour la suite des développements',
                    'Poursuite de la prise en charge support et push de branches',
                ],
            ],
            [
                'date' => '2025-10-10',
                'hours' => 8,
                'tasks' => [
                    'Diagnostic d\'un incident sur les backups (espace disque insuffisant)',
                    'Création de comptes dédiés aux nouveaux projets (LMNP/SCI) sur différentes plateformes d\'API et dépendances, et transmission des actions nécessaires',
                    'Poursuite de la refonte de reprise (côté utilisateur)',
                    'Poursuite de la refonte, validation côté utilisateur, questions spécifiques (co-indivision)',
                    'Enquête sur la localisation réelle des serveurs et préparation d\'un plan de migration',
                    'Analyse de la performance de l\'hébergement actuel et comparaison de différentes offres de VPS (prix/qualité/scalabilité)',
                ],
            ],
            [
                'date' => '2025-10-13',
                'hours' => 8,
                'tasks' => [
                    'Résolution de problèmes de support client (liens cassés, bouton "Commencer ma reprise" non fonctionnel)',
                    'Comparatif approfondi des offres d\'hébergement, achat d\'un nouveau serveur et configuration côté OVH',
                    'Intégration du nouveau serveur avec l\'outil de déploiement',
                    'Préparation des noms de domaines, bases de données et support LMNP',
                ],
            ],
            [
                'date' => '2025-10-14',
                'hours' => 11.5,
                'tasks' => [
                    'Préparation de la migration vers le nouveau serveur (résolution de conflits, association des dépôts et bases de données)',
                    'Poursuite du développement sur la refonte de la reprise (zone client puis admin)',
                    'Refonte de la zone admin sur la reprise, gestion des cas de documents invalidés',
                    'Gestion des PR Git et démonstration de la nouvelle zone de demande de documents',
                    'Préparation détaillée de l\'intervention de migration nocturne',
                    'De 23h00 à 02h30 : migration complète vers le nouveau serveur (détails techniques consignés dans un autre rapport)',
                ],
            ],
            [
                'date' => '2025-10-15',
                'hours' => 3.5,
                'tasks' => [
                    'Retour sur la refonte de reprise : validation côté client et côté admin',
                    'Mise en place d\'un système de "pré-remplissage" des données pour faciliter le travail interne',
                    'Tests d\'optimisation et de compression des fichiers du serveur',
                    'Lancement d\'un traitement d\'optimisation (en cours) et préparation de la pré-production pour la nouvelle reprise (v1)',
                    'Préparation d\'un document de test pour la future validation',
                ],
            ],
            [
                'date' => '2025-10-16',
                'hours' => 8,
                'tasks' => [
                    'Correction de la branche liée à la sidebar, PR prête pour revue',
                    'Ajustements sur la refonte de la reprise (layouts, restrictions d\'étapes, affichage admin) et préparation d\'une démonstration',
                    'Développement d\'une fonctionnalité de retour sur la même page après impersonation d\'un compte client par l\'admin',
                    'Débrief autour de la fonctionnalité "demande de documents" et achats de dépendances (Claude, composants UI)',
                    'Mise en place d\'un système de relance e-mail des clients qui interrompent le processus après paiement (scénarios autonomie/expert, rappels J+1, J+3, J+7)',
                ],
            ],
            [
                'date' => '2025-10-17',
                'hours' => 8,
                'tasks' => [
                    'Vérification de la compression (locale) des fichiers /storage et validation de l\'intégrité',
                    'Préparation du lancement du traitement de compression sur le serveur de production',
                    'Revue de PR (remontée d\'anomalies, suggestion d\'optimisations)',
                    'Fusion de la fonctionnalité de retour admin vers la page initiale',
                    'Adaptation de la fonctionnalité de relance par e-mail (ajout d\'e-mails, changement de logique vers la télétransmission)',
                    'Démarrage de la nouvelle fonctionnalité d\'historique d\'activité (qui/quoi/quand) avec mise en place du service d\'enregistrement',
                ],
            ],
            [
                'date' => '2025-10-20',
                'hours' => 8,
                'tasks' => [
                    'Réédition de la vidéo de démonstration de la reprise',
                    'Finalisation de la fonctionnalité d\'historique client (actions côté SaaS, client et équipe)',
                    'Point d\'avancement interne sur les PR en cours',
                    'Ajout d\'une création rétroactive de l\'historique',
                    'Résolution de conflits et merge sur staging (refonte reprise, demande de documents, historique)',
                    'Rendez-vous produit pour mise en place de lmnp.ai en local',
                    'Lancement de la commande de backfill d\'historique sur staging et préparation des tests',
                ],
            ],
            [
                'date' => '2025-10-21',
                'hours' => 8,
                'tasks' => [
                    'Correction de conflits de migrations sur staging',
                    'Démarrage de la v2 de la refonte de reprise comptable (prise en charge demandes de documents, signatures arbitraires)',
                    'Mise en place de Mailpit pour intercepter les e-mails sur staging (utile pour les nouvelles fonctionnalités)',
                    'Avancement sur la refonte v2',
                    'Démonstration des développements récents auprès des parties prenantes',
                    'Correctifs sur staging suite aux retours de la démo',
                    'Déploiement sur staging, communication des tests à réaliser et recueil d\'éléments manquants pour la mise en production',
                ],
            ],
            [
                'date' => '2025-10-22',
                'hours' => 8,
                'tasks' => [
                    'Poursuite de la fonctionnalité de demande de signatures arbitraires',
                    'Revue de code Livewire',
                    'Tests et correctifs supplémentaires sur la fonctionnalité de signatures arbitraires et la zone de demande de documents',
                    'Ajout des documents définitivement validés sur la fiche client (légère refonte de cette fiche côté admin)',
                ],
            ],
            [
                'date' => '2025-10-23',
                'hours' => 8,
                'tasks' => [
                    'Analyse de l\'impact de la séparation lmnp.ai / C2ags-expert sur les déclarations fiscales et adaptation des services concernés',
                    'Préparation des points à valider avec Teledec',
                    'Réception et vérification de documents nécessaires à la mise en production, anonymisation graphique',
                    'Relance pour les documents manquants et tests avec les nouveaux éléments',
                    'Démarrage d\'une nouvelle fonctionnalité de notifications internes (support/comptabilité) pour formaliser la transmission des demandes clients',
                    'Élaboration et validation du plan de mise en œuvre avec l\'équipe concernée',
                ],
            ],
            [
                'date' => '2025-10-24',
                'hours' => 8,
                'tasks' => [
                    'Finalisation du compte Veriff et transmission des informations',
                    'Édition d\'une liasse pour suppression des informations personnelles',
                    'Développement de la fonctionnalité de notification interne (entre support et comptabilité)',
                    'Démonstration d\'une première version fonctionnelle',
                    'Finalisation de la feature et préparation de son passage en test sur staging (en attente de merge du reste sur la production)',
                ],
            ],
            [
                'date' => '2025-10-27',
                'hours' => 8,
                'tasks' => [
                    'Déploiement en production des fonctionnalités suivantes : refonte de la reprise de comptabilité (v1), historique client, demande de documents, refonte de la barre latérale, changement d\'offre client par l\'admin, retour admin à la page initiale après impersonation',
                    'Génération rétroactive de l\'historique client (avec date de séparation au 27/10/2025)',
                    'Préparation d\'un nouveau staging pour tester les fonctionnalités de signatures et notifications',
                    'Support (questions/réponses techniques)',
                    'Complément de la préparation du staging (déploiement, configuration, fichiers modèles)',
                    'Développement de la v2 de la refonte de reprise sur la base des retours',
                    'L\'après-midi : rollback de la production suite à des erreurs de navigation, correctifs, puis re-soumission à tests',
                ],
            ],
            [
                'date' => '2025-10-28',
                'hours' => 8,
                'tasks' => [
                    'Finalisation des nouvelles fonctionnalités de reprise demandées par la direction produit (en attente de validation)',
                    'Développement d\'une page "Paramètres" côté admin (dont délai de traitement des reprises)',
                    'Ajustements, PR, revue de PR et déploiement sur staging',
                    'Prise d\'informations pour l\'intégration Ringover',
                    'Échanges vocaux pour cadrer la fonctionnalité, puis corrections suite aux retours',
                    'Démarrage du développement de la fonctionnalité Ringover',
                ],
            ],
            [
                'date' => '2025-10-29',
                'hours' => 8,
                'tasks' => [
                    'Développement complet de la fonctionnalité de récupération et association des transcriptions d\'appels Ringover (client/lead)',
                    'Génération automatique d\'un résumé d\'appel via IA (Claude 4.5)',
                    'Fonctionnalité terminée et soumise à revue (PR#507)',
                ],
            ],
            [
                'date' => '2025-10-30',
                'hours' => 7.5,
                'tasks' => [
                    'Élaboration d\'un plan de test complet pour les fonctionnalités à passer en production',
                    'Exécution d\'une campagne de tests sur staging, avec correctifs mineurs',
                    'Validation de la zone reprise, puis des autres zones',
                    'Préparation de la migration en production (pré-rollback compris)',
                    'Mise en production, tests en conditions réelles et monitoring',
                    'Échange avec la direction opérationnelle pour vérifier le ressenti terrain',
                    'Point avec l\'équipe technique pour planifier la suite',
                ],
            ],
            [
                'date' => '2025-10-31',
                'hours' => 8,
                'tasks' => [
                    'Bilan des projets de développement en cours et vérification de l\'état de santé du serveur live après mise en production',
                    'Préparation d\'un merge important de branche d\'interface',
                    'Clarification et priorisation des tâches restantes (focus sur éléments rapides et importants)',
                    'Intégration des mentions légales/CGU en HTML dans le site (remplacement des PDF)',
                    'Migration du projet front vers Tailwind 4.1 et correction d\'1 bug critique + 2 majeurs',
                    'Préparation de la branche pour accueillir la librairie Flux',
                    'Ajout de Flux et début du merge avec les autres réalisations (avancement 5–10%)',
                ],
            ],
            // November 2025
            [
                'date' => '2025-11-04',
                'hours' => 8,
                'tasks' => [
                    'Support client : déblocage d\'une signature bloquée par manque de complétude des amortissements experts',
                    'Poursuite de l\'adaptation v1/v2 (interface)',
                    'Finalisation et déploiement sur staging (base de travail)',
                    'Adaptation des pages déjà faites côté back-office (admins, clients, front)',
                    'Clarification sur la branche d\'interface front à utiliser',
                ],
            ],
            [
                'date' => '2025-11-05',
                'hours' => 8,
                'tasks' => [
                    'Avancement des pages v2 côté "Exploitant"',
                    'Support client sur un problème de reprise (civilité) non reproductible sur les autres environnements',
                    'Tests de confirmation en production',
                    'Finalisation et optimisation de la zone "Exploitant"',
                    'Mise à jour de la zone "Logements"',
                    'Résolution et clôture de deux tickets de support (arrêt d\'activité et problème de clic sur "Signature")',
                ],
            ],
            [
                'date' => '2025-11-06',
                'hours' => 8,
                'tasks' => [
                    'Poursuite et complétion de la zone "Logements"',
                    'Démarrage de la v2 des amortissements (autonomie)',
                    'Finalisation de la zone amortissements autonomie',
                    'Refonte de la logique d\'affichage pour éviter la multiplication des modales (meilleure maintenabilité)',
                    'Point d\'avancement',
                ],
            ],
            [
                'date' => '2025-11-07',
                'hours' => 8,
                'tasks' => [
                    'Développement de la totalité de la zone amortissements expert (avec refonte fonctionnelle et passage en modales)',
                    'Refonte de la zone recettes et amélioration des actions/modales associées',
                    'Réunion audio de support à la direction comptable',
                    'Mise en œuvre de corrections issues des retours',
                    'Démarrage de la zone "Charges d\'exploitation"',
                ],
            ],
            [
                'date' => '2025-11-10',
                'hours' => 8,
                'tasks' => [
                    'Finalisation de la zone charges d\'exploitation',
                    'Finalisation de la zone charges financières',
                    'Finalisation de la zone usages personnels',
                    'Finalisation des zones OGA-CGA et statut LMNP/LMP',
                    'Démarrage et finalisation progressive des zones régime social, TVA, paiement, signature, télétransmission (autonomie/expert), aide à la déclaration, FEC, conseils fiscaux et "Mes documents"',
                    'Correction d\'un lien erroné sur la production',
                ],
            ],
            [
                'date' => '2025-11-12',
                'hours' => 8,
                'tasks' => [
                    'Ajustements sur la zone "Mes documents" (preview PDF)',
                    'Zone profil client',
                    'Recensement des pages non encore revues côté dashboard client + zone de preview des factures',
                    'Page divers (notifications, misc)',
                    'Correctifs sur le dark mode',
                    'Support client sur un blocage d\'étape (ajustement de la logique de blocage en fonction de la fin d\'exercice)',
                    'Zone de retour admin et responsive',
                    'Rework fonctionnel des pages SIREN et Exploitant',
                ],
            ],
            [
                'date' => '2025-11-13',
                'hours' => 8,
                'tasks' => [
                    'Rework de la page "logements"',
                    'Rework du hub amortissements (enregistrement du choix de vue utilisateur)',
                    'Rework du hub Recettes, Charges, Usages et des pages associées',
                    'Rework de la zone statut LMNP/LMP (simplification visuelle)',
                    'Rework de la zone régime social',
                    'Rework des pages TVA, Signature, Télétransmission et Aide à la déclaration',
                ],
            ],
            [
                'date' => '2025-11-14',
                'hours' => 8,
                'tasks' => [
                    'Rework fonctionnel de FEC, Mes documents et Profil',
                    'Rework de la zone de navigation',
                    'Récupération des modifications réalisées directement sur la prod (support) et intégration dans la v2 pour éviter les divergences',
                    'Refonte de multiples éléments transverses (favicon, notifications, tracking, recaptcha, composants divers)',
                    'Développement de la zone "Demande de documents" v2 et des cas particuliers (ex. usufruit)',
                    'Refonte des pages satellites d\'authentification',
                    'Rework de la page d\'inscription',
                    'Démarrage de la zone de sélection d\'offre et saisie initiale d\'informations',
                ],
            ],
            [
                'date' => '2025-11-17',
                'hours' => 8,
                'tasks' => [
                    'Suite de la zone d\'inscription (saisie SIREN, informations entreprise et personnelles)',
                    'Réunion de cadrage : calendrier projets SCI, clôture dev LMNP, passage front à Flux, bascule sur compte expert-comptable Télédec, amortissements automatiques',
                    'Rédaction d\'une synthèse de réunion',
                    'Améliorations de l\'UX : bascule automatique d\'onglet après enregistrement, affichage des modules facultatifs, largeur des champs, aide à la déclaration',
                    'Refonte du menu de navigation (groupes par thème)',
                    'Intégration d\'une nouvelle stepline centrée sur la prochaine étape avec possibilité de détail',
                ],
            ],
            [
                'date' => '2025-11-18',
                'hours' => 8,
                'tasks' => [
                    'Layout v2 de la reprise de comptabilité et premier composant',
                    'Refonte v2 de tout le processus de reprise',
                    'Support sur le projet SCI',
                    'Travail sur le responsive de la v2',
                    'Support technique pour une cliente bloquée puis déploiement sur production',
                    'Finalisation du responsive v2',
                ],
            ],
            [
                'date' => '2025-11-20',
                'hours' => 15,
                'tasks' => [
                    'Réunion de répartition des tâches restantes',
                    'Nettoyage du staging, ajout de la transcription Ringover et fusion sur la production (préparation de la nouvelle fonctionnalité Télédec)',
                    'Tests sur staging pour la télétransmission automatique (expert/autonomie)',
                    'Récupération d\'une branche d\'interface admin v2, remise en ordre des fichiers, correction des dépendances, fusion et vérifications',
                    'Ajustements des pages "Gestion des erreurs", "Paramètres", "Leads"',
                    'Fin d\'adaptation des pages Leads, simulateurs, bannière et début des pages ressources',
                    'Finalisation de la zone ressources',
                    'Finalisation des pages Catégories, Références, Équipe, Notifications internes, Demande de documents (back-office)',
                ],
            ],
            [
                'date' => '2025-11-21',
                'hours' => 8.5,
                'tasks' => [
                    'Poursuite de l\'adaptation de la zone administrateur v2 (clients, offres reprises, liasses et sous-pages)',
                    'Adaptation de l\'affichage spécifique pour les experts (dashboard adapté)',
                    'Intégration dans la v2 de la transcription audio → texte et tests fonctionnels sur l\'interface v2 (admin, expert, client, reprise autonomie/expert)',
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

        $io->success(sprintf('Successfully imported %d time entries for Sept-Nov 2025!', $count));
        $io->info(sprintf('Total hours: %.1fh', $totalHours));

        return Command::SUCCESS;
    }
}
