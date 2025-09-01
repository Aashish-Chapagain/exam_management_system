from django.shortcuts import render, redirect 
from django.contrib.auth import authenticate, login
from django.contrib import messages

def adminlogin(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username , password = password)
        if user is not None: 
            login(request, user)
            return redirect('dashboard_home')
        else :
            messages.error(request, "Invalid credentials")
    return render(request, 'admin_login/adminlogin.html')

# def adminlogin(request):
#     return render(request, 'admin_login/adminlogin.html')