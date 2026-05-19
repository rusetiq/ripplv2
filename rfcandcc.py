def writefile():
    with open('new.txt', 'w') as file:
        n = int(input("Enter how many files pls: "))
        for i in range(n):
            file.write(input("Enter content: ") + "\n")

def read_and_count():
    with open('new.txt', 'r') as file:
        content = file.read()
        print(f'Number of characters in the file: {len(content)}')
        print(f'Number of words in the file: {len(content.split())}')

while True:
    print("Enter your choice : ")
    print("1. Write in file")
    print("2. Read and count")
    print("3. Exit")
    choice = int(input("Enter your choice: "))
    if choice == 1:
        writefile()
    elif choice == 2:
        read_and_count()
    elif choice == 3:
        break