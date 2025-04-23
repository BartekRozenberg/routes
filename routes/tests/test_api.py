from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from ..models import Route, Point, BackgroundImage

class APITestCaseRoutes(APITestCase):
    def setUp(self):
        # Tworzenie użytkowników
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.other_user = User.objects.create_user(username='otheruser', password='password123')

        # Tworzenie tokenu autoryzacyjnego
        self.client.login(username='testuser', password='password123')

        # Tworzenie obrazu tła
        self.background_image = BackgroundImage.objects.create(name='Test Background', image='backgrounds/test.png')

        # Tworzenie trasy
        self.route = Route.objects.create(name='Test Route', user=self.user, background=self.background_image)

    def test_authentication_required(self):
        # Wylogowanie użytkownika
        self.client.logout()

        # Próba dostępu do endpointu bez autoryzacji
        response = self.client.get('/api/routes/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_user_routes(self):
        # Pobieranie listy tras użytkownika
        response = self.client.get('/api/routes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Route')

    def test_create_route(self):
        # Tworzenie nowej trasy
        response = self.client.post('/api/routes/', {
            'name': 'New Route',
            'background': self.background_image.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Route.objects.count(), 2)
        self.assertEqual(Route.objects.last().name, 'New Route')

    def test_get_route_details(self):
        # Pobieranie szczegółów konkretnej trasy
        response = self.client.get(f'/api/routes/{self.route.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Route')

    def test_delete_route(self):
        # Usuwanie trasy
        response = self.client.delete(f'/api/routes/{self.route.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Route.objects.count(), 0)

    def test_user_cannot_access_other_users_routes(self):
        # Próba dostępu do trasy innego użytkownika
        other_route = Route.objects.create(name='Other Route', user=self.other_user, background=self.background_image)
        response = self.client.get(f'/api/routes/{other_route.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class APITestCasePoints(APITestCase):
    def setUp(self):
        # Tworzenie użytkownika i trasy
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.login(username='testuser', password='password123')
        self.background_image = BackgroundImage.objects.create(name='Test Background', image='backgrounds/test.png')
        self.route = Route.objects.create(name='Test Route', user=self.user, background=self.background_image)

    def test_add_point_to_route(self):
        # Dodawanie punktu do trasy
        response = self.client.post(f'/api/routes/{self.route.id}/points/', {
            'x': 100,
            'y': 200
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Point.objects.count(), 1)
        self.assertEqual(Point.objects.last().x, 100)

    def test_get_points_for_route(self):
        # Pobieranie listy punktów dla trasy
        Point.objects.create(route=self.route, x=100, y=200, order=1)
        response = self.client.get(f'/api/routes/{self.route.id}/points/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['x'], 100)

    def test_delete_point_from_route(self):
        # Usuwanie punktu z trasy
        point = Point.objects.create(route=self.route, x=100, y=200, order=1)
        response = self.client.delete(f'/api/routes/{self.route.id}/points/{point.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Point.objects.count(), 0)

    def test_invalid_data_handling(self):
        # Próba dodania punktu z niepoprawnymi danymi
        response = self.client.post(f'/api/routes/{self.route.id}/points/', {
            'x': 'invalid',
            'y': 200
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('x', response.data)