<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251017135027 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE time_entry ADD COLUMN app VARCHAR(10) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__time_entry AS SELECT id, user_id, hours, date, tasks, created_at FROM time_entry');
        $this->addSql('DROP TABLE time_entry');
        $this->addSql('CREATE TABLE time_entry (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, user_id INTEGER NOT NULL, hours NUMERIC(5, 2) NOT NULL, date DATE NOT NULL, tasks CLOB NOT NULL --(DC2Type:json)
        , created_at DATETIME NOT NULL, CONSTRAINT FK_6E537C0CA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO time_entry (id, user_id, hours, date, tasks, created_at) SELECT id, user_id, hours, date, tasks, created_at FROM __temp__time_entry');
        $this->addSql('DROP TABLE __temp__time_entry');
        $this->addSql('CREATE INDEX IDX_6E537C0CA76ED395 ON time_entry (user_id)');
    }
}
