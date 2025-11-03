<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[AsCommand(
    name: 'app:test-email',
    description: 'Envoie un email de test via MailerSend',
)]
class TestEmailCommand extends Command
{
    public function __construct(
        private MailerInterface $mailer,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $email = (new Email())
                ->from($_ENV['MAIL_FROM_ADDRESS'])
                ->to('DevMazzitelli@gmail.com')
                ->subject('Email de test depuis LMNP.AI')
                ->text('Ceci est un email de test envoyé via MailerSend depuis l\'application LMNP.AI.')
                ->html('<p>Ceci est un <strong>email de test</strong> envoyé via MailerSend depuis l\'application <em>LMNP.AI</em>.</p>');

            $this->mailer->send($email);

            $io->success('Email envoyé avec succès à DevMazzitelli@gmail.com');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erreur lors de l\'envoi de l\'email : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
