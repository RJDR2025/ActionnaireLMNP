<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class MainController extends AbstractController
{
    #[Route('/', name: 'app_main')]
    public function index(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/suivi/lmnp_ai', name: 'app_lmnp_suivi')]
    public function lmnpSuivi(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/suivi/sci_ai', name: 'app_sci_suivi')]
    public function sciSuivi(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/admin/lmnp_ai', name: 'app_lmnp_admin')]
    public function lmnpAdmin(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/admin/sci_ai', name: 'app_sci_admin')]
    public function sciAdmin(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/admin/lmnp_ai/time-tracking', name: 'app_lmnp_admin_time_tracking')]
    public function lmnpAdminTimeTracking(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/admin/lmnp_ai/users', name: 'app_lmnp_admin_users')]
    public function lmnpAdminUsers(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/admin/sci_ai/time-tracking', name: 'app_sci_admin_time_tracking')]
    public function sciAdminTimeTracking(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/admin/sci_ai/users', name: 'app_sci_admin_users')]
    public function sciAdminUsers(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/actionnaires', name: 'app_actionnaires')]
    public function actionnaires(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }

    #[Route('/actionnaires/ajouter', name: 'app_actionnaires_add')]
    public function actionnairesAdd(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
        ]);
    }
}
