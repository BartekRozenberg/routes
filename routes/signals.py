from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GameBoard, Path
from .views import event_queue  # Importuj event_queue z views.py

@receiver(post_save, sender=GameBoard)
def notify_new_board(sender, instance, created, **kwargs):
    if created:
        event_queue.append({
            "type": "newBoard",
            "data": {
                "board_id": instance.id,
                "board_name": instance.name,
                "creator_username": instance.user.username
            }
        })

@receiver(post_save, sender=Path)
def notify_new_path(sender, instance, created, **kwargs):
    if created:
        print(f"New path created: {instance.id}, board: {instance.board.id}")
        event_queue.append({
            "type": "newPath",
            "data": {
                "path_id": instance.id,
                "board_id": instance.board.id,
                "board_name": instance.board.name,
                "user_username": instance.user.username
            }
        })