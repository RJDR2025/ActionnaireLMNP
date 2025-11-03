<?php

namespace App\Repository;

use App\Entity\MonthlyHoursPlanning;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MonthlyHoursPlanning>
 */
class MonthlyHoursPlanningRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MonthlyHoursPlanning::class);
    }

    public function findByYearAndApp(int $year, string $app): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.year = :year')
            ->andWhere('p.app = :app')
            ->setParameter('year', $year)
            ->setParameter('app', $app)
            ->orderBy('p.user', 'ASC')
            ->addOrderBy('p.month', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserMonthYear(User $user, int $month, int $year, string $app): ?MonthlyHoursPlanning
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.user = :user')
            ->andWhere('p.month = :month')
            ->andWhere('p.year = :year')
            ->setParameter('user', $user)
            ->setParameter('month', $month)
            ->setParameter('year', $year)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
