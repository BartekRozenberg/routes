from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from ..models import Route, Point, BackgroundImage

class RouteManagementTestCase(TestCase):
    def setUp(self):
        # Tworzenie użytkownika
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.login(username='testuser', password='password123')

        # Tworzenie obrazu tła
        self.background_image = BackgroundImage.objects.create(name='Test Background', image='backgrounds/test.png')

        # Tworzenie trasy
        self.route = Route.objects.create(name='Test Route', user=self.user, background=self.background_image)

    def test_route_list_view(self):
        # Sprawdzenie poprawności wyświetlania listy tras
        response = self.client.get(reverse('route_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Route')

    def test_create_route(self):
        # Sprawdzenie procesu tworzenia nowej trasy
        response = self.client.post(reverse('create_route'), {
            'name': 'New Route',
            'background': self.background_image.id
        })
        self.assertEqual(response.status_code, 302)  # Przekierowanie po utworzeniu
        self.assertEqual(Route.objects.count(), 2)
        new_route = Route.objects.last()
        self.assertEqual(new_route.name, 'New Route')
        self.assertEqual(new_route.user, self.user)
        self.assertEqual(new_route.background, self.background_image)

    def test_add_point_to_route(self):
        # Sprawdzenie poprawności dodawania punktu do trasy
        response = self.client.post(reverse('route_detail', args=[self.route.id]), {
            'x': 100,
            'y': 200
        })
        self.assertEqual(response.status_code, 302)  # Przekierowanie po dodaniu punktu
        self.assertEqual(Point.objects.count(), 1)
        point = Point.objects.last()
        self.assertEqual(point.route, self.route)
        self.assertEqual(point.x, 100)
        self.assertEqual(point.y, 200)

    def test_delete_point_from_route(self):
        # Tworzenie punktu
        point = Point.objects.create(route=self.route, x=100, y=200, order=1)

        # Sprawdzenie poprawności usuwania punktu
        response = self.client.post(reverse('delete_point', args=[self.route.id, point.id]))
        self.assertEqual(response.status_code, 302)  # Przekierowanie po usunięciu punktu
        self.assertEqual(Point.objects.count(), 0)
