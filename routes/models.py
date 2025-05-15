from django.db import models
from django.contrib.auth.models import User

class BackgroundImage(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='backgrounds/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Route(models.Model):
    name = models.CharField(max_length=100)
    background = models.ForeignKey(BackgroundImage, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Point(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    x = models.IntegerField()
    y = models.IntegerField()
    route = models.ForeignKey(Route, related_name='points', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Point({self.x}, {self.y})"

    class Meta:
        ordering = ['order']

# Do przytrzymania informacji o kropkach na planszy
class GameBoard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    rows = models.IntegerField()
    cols = models.IntegerField()
    dots = models.JSONField(default=list)  # Przechowuje listę kropek w formacie JSON

    def __str__(self):
        return self.name