<?php

namespace App\Repository;

use App\Entity\Actionnaire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Actionnaire>
 */
class ActionnaireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Actionnaire::class);
    }

    public function findAllOrderedByName(): array
    {
        return $this->createQueryBuilder('a')
            ->orderBy('a.nom', 'ASC')
            ->addOrderBy('a.prenom', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
