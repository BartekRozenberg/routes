from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

class AuthTestCase(TestCase):
    def setUp(self):
        # Tworzenie użytkownika
        self.user = User.objects.create_user(username='testuser', password='password123')

    def test_login_required_redirect(self):
        # Sprawdzenie przekierowania niezalogowanego użytkownika
        response = self.client.get(reverse('route_list'))
        self.assertRedirects(response, f"{reverse('login')}?next={reverse('route_list')}")

    def test_login_page_accessible(self):
        # Sprawdzenie dostępności strony logowania
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)

    def test_successful_login(self):
        # Sprawdzenie poprawnego logowania
        response = self.client.post(reverse('login'), {'username': 'testuser', 'password': 'password123'})
        self.assertRedirects(response, reverse('route_list'))
        self.assertTrue('_auth_user_id' in self.client.session)

    def test_successful_logout(self):
        # Sprawdzenie poprawnego wylogowania
        self.client.login(username='testuser', password='password123')
        response = self.client.get(reverse('logout'))
        self.assertEqual(response.status_code, 405)