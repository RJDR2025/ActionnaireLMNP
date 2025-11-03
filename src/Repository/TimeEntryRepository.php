<?php

namespace App\Repository;

use App\Entity\TimeEntry;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TimeEntry>
 */
class TimeEntryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TimeEntry::class);
    }

    /**
     * Find entries for a user filtered by month, year and app
     */
    public function findByUserAndMonth(User $user, int $month, int $year, ?string $app = null): array
    {
        $startDate = new \DateTime("$year-$month-01");
        $endDate = clone $startDate;
        $endDate->modify('last day of this month');

        $qb = $this->createQueryBuilder('t')
            ->andWhere('t.user = :user')
            ->andWhere('t.date BETWEEN :start AND :end')
            ->setParameter('user', $user)
            ->setParameter('start', $startDate)
            ->setParameter('end', $endDate);

        if ($app !== null) {
            $qb->andWhere('t.app = :app')
               ->setParameter('app', $app);
        }

        return $qb->orderBy('t.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all entries filtered by month, year and app (for admin)
     */
    public function findAllByMonth(int $month, int $year, ?string $app = null): array
    {
        $startDate = new \DateTime("$year-$month-01");
        $endDate = clone $startDate;
        $endDate->modify('last day of this month');

        $qb = $this->createQueryBuilder('t')
            ->andWhere('t.date BETWEEN :start AND :end')
            ->setParameter('start', $startDate)
            ->setParameter('end', $endDate);

        if ($app !== null) {
            $qb->andWhere('t.app = :app')
               ->setParameter('app', $app);
        }

        return $qb->orderBy('t.date', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
