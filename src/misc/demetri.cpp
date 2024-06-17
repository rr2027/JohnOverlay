//***************************************************************************************
//
// Programmer: Demetri Poulos
//
// Class: Computer Science 1113
//
// Program Description:
//
//***************************************************************************************
#include <iostream>
#include <string>
#include <cctype>
#include <fstream>
using namespace std;

char** ArrayCreator() {
    char ** cuttingArrayTable = new char*[2];
    for (int i = 0; i < 2; i++) {
        cuttingArrayTable[i] = new char[2];
    }
    return cuttingArrayTable;
}

void movePos(int &x, int &y, int num, int index) {
    switch (index) {
        case 0: //RDLU
            y += num;
            break;
        case 1:
            x += num;
            break;
        case 2:
            y -= num;
            break;
        case 3:
            x -= num;
            break;
    }

}

void cutArray(int x, int y, int num, int index, char** array) {
    switch (index) {
        case 0:
            for (int i = 0; i < num + 1; i++) {
                array[x][y + i] = '*';
            }
            break;
        case 1:
             for (int i = 0; i < num + 1; i++) {
                array[x + i][y] = '*';
            }
            break;
        case 2:
             for (int i = 0; i < num + 1; i++) {
                array[x][y - i] = '*';
            }
            break;
        case 3:
            for (int i = 0; i < num + 1; i++) {
                    array[x - i][y] = '*';
                }
            break;
    }

}

int main() {

int xPos = 0, yPos = 0, xMax = 0, yMax = 0;
char cut = 'O';
char direction[4] = {'R', 'D', 'L', 'U'};
int indexDir = 0;
char** DcutArray = ArrayCreator();
string str;
ifstream infile;
infile.open("lasert.txt");
    while (getline(infile, str)) {
        switch (str[0]) {
            case 'I':
                cut = 'I';
                break;
            case 'A':
                if (cut == 'I') {
                    cutArray(xPos, yPos, str[2] - '0', indexDir, DcutArray);

                }
                movePos(xPos, yPos, str[2] - '0', indexDir);
                if (xPos > xMax) {
                    xMax = xPos;
                }
                if (yPos > yMax) {
                    yMax = yPos;
                }
                break;
            case 'O':
                cut = 'O';
                break;
            case 'R':
                indexDir += 1;
                if (indexDir == 4) {
                    indexDir = 0;
                }
                break;
            case 'L':
                indexDir -= 1;
                if (indexDir == -1) {
                    indexDir = 3;
                }
                break;
            default:
                if (str != "") { 
                    cout << "Ecountered an Invalid command. Terminating.";
                    exit(1113);
                }
                break;
        }
        if (str == "") {
            /*for (int i = 0; i < yMax; i++ ) {
                for (int j = 0; j < xMax; j++) {
                    cout << DcutArray[i][j];
                }
                cout << endl;
            }*/
            for (int i = 0; i < yMax; i++ ) {
                for (int j = 0; j < xMax; j++) {
                    cout << DcutArray[i][j];
                }
                cout << endl;
            }
        }
    }
}