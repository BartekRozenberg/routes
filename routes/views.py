from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .forms import RouteForm, PointForm
from .models import Route, Point, GameBoard, Path
from django.contrib.auth.decorators import login_required
from routes.models import Route, Point
from django.contrib.auth.forms import UserCreationForm
from django.db.models import Max
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
import json

# Logowanie:
def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Konto dla użytkownika {username} zostało utworzone! Możesz się teraz zalogować.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})


@login_required
def route_list(request):
    boards = GameBoard.objects.filter(user=request.user)
    routes = Route.objects.filter(user=request.user)
    return render(request, 'routes/route_list.html', {'boards': boards, 'routes': routes})

@login_required
def create_route(request):
    if request.method == 'POST':
        form = RouteForm(request.POST)
        if form.is_valid():
            route = form.save(commit=False)
            route.user = request.user
            route.save()
            messages.success(request, 'Route created successfully!')
            return redirect('route_list')
    else:
        form = RouteForm()
    return render(request, 'routes/create_route.html', {'form': form})

@login_required
def route_detail(request, route_id):
    route = get_object_or_404(Route, id=route_id)
    points = route.points.all()
    if request.method == 'POST':
        form = PointForm(request.POST)
        if form.is_valid():
            x = form.cleaned_data['x']
            y = form.cleaned_data['y']
            order = route.points.aggregate(Max('order'))['order__max'] or 0
            order += 1
            Point.objects.create(route=route, x=x, y=y, order=order)
            messages.success(request, 'Point added successfully!')
            return redirect('route_detail', route_id=route.id)
    else:
        form = PointForm()
    return render(request, 'routes/route_detail.html', {'route': route, 'points': points, 'form': form})

@login_required
def delete_point(request, route_id, point_id):
    route = get_object_or_404(Route, id=route_id)
    point = get_object_or_404(Point, id=point_id, route=route)
    if request.method == 'POST':
        point.delete()
        messages.success(request, 'Point deleted successfully!')
        return redirect('route_detail', route_id=route.id)
    return render(request, 'delete_point.html', {'route': route, 'point': point})

@login_required
def create_or_edit_board(request, board_id=None):
    if request.method == 'POST' and request.content_type == 'application/json':
        data = json.loads(request.body)

        name = data.get('name')
        rows = data.get('rows')
        cols = data.get('cols')
        dots = data.get('dots')

        if not name or not rows or not cols or not dots:
            return JsonResponse({'message': 'Nieprawidłowe dane.'}, status=400)

        if board_id:
            # Edycja istniejącej planszy
            board = get_object_or_404(GameBoard, id=board_id, user=request.user)
            board.name = name
            board.rows = rows
            board.cols = cols
            board.dots = dots
            board.save()
        else:
            # Tworzenie nowej planszy
            board = GameBoard.objects.create(
                user=request.user,
                name=name,
                rows=rows,
                cols=cols,
                dots=dots
            )

        return JsonResponse({'message': 'Plansza została zapisana.', 'board_id': board.id})

    # Pobranie planszy do edycji lub ustawienie na `None` dla nowej planszy
    board = get_object_or_404(GameBoard, id=board_id, user=request.user) if board_id else None

    return render(request, 'routes/create_or_edit_board.html', {'board': board})

@login_required
def delete_board(request, board_id):
    board = get_object_or_404(GameBoard, id=board_id, user=request.user)
    if request.method == 'POST':
        board.delete()
        messages.success(request, 'Plansza została usunięta.')
    return HttpResponseRedirect(reverse('route_list'))

@login_required
def delete_route(request, route_id):
    route = get_object_or_404(Route, id=route_id, user=request.user)
    if request.method == 'POST':
        route.delete()
        messages.success(request, 'Trasa została usunięta.')
    return HttpResponseRedirect(reverse('route_list'))

@login_required
def index(request):
    return render(request, 'routes/index.html')

@login_required
@csrf_exempt
def save_path(request, board_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        path_data = data.get('path_data', [])

        if not path_data:
            return JsonResponse({'message': 'Nieprawidłowe dane.'}, status=400)

        board = get_object_or_404(GameBoard, id=board_id)
        path, created = Path.objects.update_or_create(
            user=request.user,
            board=board,
            defaults={'path_data': path_data}
        )

        return JsonResponse({'message': 'Ścieżka została zapisana.'})

@login_required
def load_path(request, board_id):
    board = get_object_or_404(GameBoard, id=board_id)
    path = Path.objects.filter(board=board, user=request.user).first()

    return JsonResponse({
        'rows': board.rows,
        'cols': board.cols,
        'dots': board.dots,
        'path_data': path.path_data if path else []
    })

@login_required
def select_board_for_path(request):
    boards = GameBoard.objects.all()  # Wyświetl wszystkie plansze
    return render(request, 'routes/select_board_for_path.html', {'boards': boards})

@login_required
def edit_path(request, path_id=None):
    if path_id:
        # Pobierz istniejącą ścieżkę lub zwróć 404, jeśli użytkownik nie ma dostępu
        path = get_object_or_404(Path, id=path_id, user=request.user)
    else:
        # Jeśli `path_id` nie jest podane, utwórz nową ścieżkę
        board_id = request.GET.get('board_id')  # Pobierz `board_id` z parametrów GET
        board = get_object_or_404(GameBoard, id=board_id)
        name = request.GET.get('name', 'Unnamed Path')  # Pobierz nazwę z parametrów GET
        path = Path.objects.create(user=request.user, board=board, name=name, path_data=[])

    board = path.board
    return render(request, 'routes/edit_path.html', {'board': board, 'path': path, 'path_name': path.name})

@login_required
def delete_path(request, path_id):
    path = get_object_or_404(Path, id=path_id, user=request.user)
    if request.method == 'POST':
        path.delete()
        messages.success(request, 'Ścieżka została usunięta.')
    return redirect('route_list')