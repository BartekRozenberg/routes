import redis
import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GameBoard, Path

# Połącz się z Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

@receiver(post_save, sender=GameBoard)
def notify_new_board(sender, instance, created, **kwargs):
    if created:
        event = {
            "type": "newBoard",
            "data": {
                "board_id": instance.id,
                "board_name": instance.name,
                "creator_username": instance.user.username
            }
        }
        redis_client.publish('notifications', json.dumps(event))  # Publikuj zdarzenie w Redis

@receiver(post_save, sender=Path)
def notify_new_path(sender, instance, created, **kwargs):
    if created:
        event = {
            "type": "newPath",
            "data": {
                "path_id": instance.id,
                "board_id": instance.board.id,
                "board_name": instance.board.name,
                "user_username": instance.user.username
            }
        }
        print(f"Publishing newPath event to Redis: {event}")  # Logowanie zdarzenia
        redis_client.publish('notifications', json.dumps(event))  # Publikuj zdarzenie w Redis