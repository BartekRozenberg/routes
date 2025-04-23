from django.test import TestCase
from django.contrib.auth.models import User
from ..models import Route, Point, BackgroundImage

class ModelsTestCase(TestCase):
    def setUp(self):
        # Tworzenie użytkownika
        self.user = User.objects.create_user(username='testuser', password='password123')
        # Tworzenie obrazu tła
        self.background_image = BackgroundImage.objects.create(name='Test Background', image='backgrounds/test.png')
        # Tworzenie trasy
        self.route = Route.objects.create(name='Test Route', user=self.user, background=self.background_image)
        # Tworzenie punktu trasy
        self.point = Point.objects.create(route=self.route, x=100, y=200, order=1)

    def test_user_creation(self):
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(self.user.username, 'testuser')

    def test_background_image_creation(self):
        self.assertEqual(BackgroundImage.objects.count(), 1)
        self.assertEqual(self.background_image.name, 'Test Background')

    def test_route_creation(self):
        self.assertEqual(Route.objects.count(), 1)
        self.assertEqual(self.route.name, 'Test Route')
        self.assertEqual(self.route.user, self.user)
        self.assertEqual(self.route.background, self.background_image)

    def test_point_creation(self):
        self.assertEqual(Point.objects.count(), 1)
        self.assertEqual(self.point.route, self.route)
        self.assertEqual(self.point.x, 100)
        self.assertEqual(self.point.y, 200)
        self.assertEqual(self.point.order, 1)