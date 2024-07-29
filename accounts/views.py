from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import render, redirect
from .forms import RegisterForm
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.view_intro:
                user.view_intro = False
                user.save()
                return redirect('game_intro')
            return redirect('game_main')
        else:
            return render(request, 'login.html', {'error': 'Invalid username or password'})
    return render(request, 'login.html')

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def forgot_view(request):
    # Handle password recovery logic
    # not implemented...
    return render(request, 'forgot.html')
