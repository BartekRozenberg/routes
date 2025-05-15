from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .forms import RouteForm, PointForm
from .models import Route, Point, GameBoard
from django.contrib.auth.decorators import login_required
from routes.models import Route, Point
from django.contrib.auth.forms import UserCreationForm
from django.db.models import Max
from django.http import HttpResponseRedirect
from django.urls import reverse

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
    if board_id:
        board = get_object_or_404(GameBoard, id=board_id, user=request.user)
    else:
        board = None

    if request.method == 'POST':
        name = request.POST.get('name')
        rows = int(request.POST.get('rows'))
        cols = int(request.POST.get('cols'))
        dots = request.POST.get('dots')  # JSON string

        if board:
            board.name = name
            board.rows = rows
            board.cols = cols
            board.dots = dots
            board.save()
        else:
            GameBoard.objects.create(
                user=request.user,
                name=name,
                rows=rows,
                cols=cols,
                dots=dots
            )
        return redirect('route_list')

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