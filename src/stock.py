initial = float(input("Input your initial amount: "))
interest = float(input("Input the % gain you can make a day: "))/100
time = int(input("Input number of days: "))

i = 1
while i <= time:
    jim = initial

    initial = (initial * interest) + initial
    print(f"[day {i}] total = ${round(initial, 2)}")
    i += 1

