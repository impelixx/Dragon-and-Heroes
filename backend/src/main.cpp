#include <iostream>
#include <string>
#include <random>
#include <chrono>
#include <vector>
#include <algorithm>


const std::string RED_COLOR = "\033[31m";
const std::string GREEN_COLOR = "\033[32m";
const std::string BLACK_COLOR = "\033[30m";
const std::string RESET_COLOR = "\033[0m";

std::mt19937 rng(std::chrono::steady_clock::now().time_since_epoch().count());

class Attacker {
public:
  Attacker() : health_(100), attack_(20) {}
  Attacker(int health, int attack) : health_(health), attack_(attack) {}
  virtual bool isEnemy() = 0;
  virtual int attack(Attacker *target) = 0;
  bool isAlive() { return health_ > 0; }
  void reduceHealth(int amount) { health_ -= amount; }
  int getHealth() { return health_; }

protected:
  int health_;
  int attack_;
};

class Enemy : public Attacker {
public:
  Enemy(int health, int attack) : Attacker(health, attack) {}
  Enemy(int health, int attack, std::string name) : Attacker(health, attack), name_(name) {}
  bool isEnemy() final override { return true; }
  int attack(Attacker *target) override {
    target->reduceHealth(attack_);
    return attack_;
  }
  std::string getName(){
    return name_;
  }
  virtual void checkAnswer(Attacker* player) = 0;
  virtual void SetAnswer(int answer) = 0;
  virtual void AskQuestion() = 0;

protected:
  std::string name_;
  int answer_;
  std::string question_;
};

class RedDragon : public Enemy {
public:
  RedDragon() : Enemy(100, 10, "Красный") {}
  void checkAnswer(Attacker* player) override {
    std::string answer;
    std::cin >> answer;
    if (std::stoi(answer) == answer_) {
      std::cout << name_ << " дракон не смог увернуться, ты нанес ему удар." << std::endl;
      player->attack(this);
      std::cout << name_ << " дракон потерял здоровье, у него осталось " << health_ << " здоровья" << std::endl;
    } else {
      std::cout << "Неправильно " << name_ << " дракон нанес тебе удар" << std::endl;
      this->attack(player);
      std::cout << "Теперь у тебя осталось " << player->getHealth() << " здоровья" << std::endl;
    }
  }
  void SetAnswer(int answer) override {
    answer_ = answer;
  }
  void AskQuestion() override {
    int num1 = rand() % 10;
    int num2 = rand() % 10;
    SetAnswer(num1 + num2);
    std::cout << RED_COLOR << name_ << " дракон спрашивает сколько будет "<< num1 << " + " << num2 << " = ";
  }
};

class GreenDragon : public Enemy {
public:
  GreenDragon() : Enemy(100, 10, "Зеленый") {}
  void checkAnswer(Attacker* player) override {
    std::string answer;
    std::cin >> answer;
    if (std::stoi(answer) == answer_) {
      std::cout << name_ << " дракон потерял здоровье, у него осталось " << health_ << " здоровья" << std::endl;
      player->attack(this);
      std::cout << name_ << " дракон потерял здоровье, у него осталось " << health_ << " здоровья" << std::endl;
    } else {
      std::cout << "Неправильно " << name_ << " дракон нанес тебе удар" << std::endl;
      this->attack(player);
      std::cout << "Теперь у тебя осталось " << player->getHealth() << " здоровья" << std::endl;
    }
  }
  void SetAnswer(int answer) override {
    answer_ = answer;
  }
  void AskQuestion() override {
    int num1 = rand() % 10;
    int num2 = rand() % 10;
    SetAnswer(num1 * num2);
    std::cout << GREEN_COLOR << name_ << " дракон спрашивает сколько будет " << num1 << " * " << num2 << " = ";
  }
};

class  BlackDragon : public Enemy {
public:
BlackDragon() : Enemy(100, 10, "Черный") {}
  void checkAnswer(Attacker* player) override {
    std::string answer;
    std::cin >> answer;
    if (std::stoi(answer) == answer_) {
      std::cout << name_ << " дракон не смог увернуться, ты нанес ему удар." << std::endl;
      player->attack(this);
      std::cout << name_ << " дракон потерял здоровье, у него осталось " << health_ << " здоровья" << std::endl;
    } else {
      std::cout << "Неправильно " << name_ << " дракон нанес тебе удар" << std::endl;
      this->attack(player);
      std::cout << "Теперь у тебя осталось " << player->getHealth() << " здоровья" << std::endl;
    }
  }
    void AskQuestion() override {
    int num1 = rand() % 10;
    int num2 = rand() % 10;
    SetAnswer(num1 - num2);
    std::cout << BLACK_COLOR << name_ << " дракон спрашивает сколько будет " << num1 << " - " << num2 << " = ";
  }
  void SetAnswer(int answer) override {
    answer_ = answer;
  }
};

class Player final : public Attacker {
public:
  Player() : Attacker(100, 50) {}
  bool isEnemy() final override { return false; }
  int attack(Attacker *target) override {
    target->reduceHealth(attack_);
    return attack_;
  }
};

int main() {
  std::cout << RESET_COLOR << "Жила-была в далекой стране старая легенда. Говорили, что в сердце горы драконы хранят древнюю тайну, дарующую несметную силу. "
            << "Но чтобы добраться до нее, отважный воин должен победить не одного, а трех могущественных драконов: "
            << "Красного — воплощение пламени, Зеленого — стража лесов и Черного — хранителя теней. "
            << "Многие пытались, но все пали от их когтей и огненного дыхания.\n"
            << "Теперь, это твой путь, храбрец. Сможешь ли ты одолеть их и найти заветную силу?\n"
            << "Отвечай правильно на вопросы, иначе дракон нанесет тебе удар. Удачи!\n"<< std::endl;
  Player* player = new Player();
  while (player->isAlive()) {
    std::vector<Enemy*> enemies = {new RedDragon(), new GreenDragon(), new BlackDragon(), new RedDragon(), new GreenDragon(), new BlackDragon()};
    // std::ranom_shuffle(enemies.begin(), enemies.end(), get);
    for (auto enemy : enemies) {
      std::cout << RESET_COLOR << enemy->getName() << " дракон напал на тебя" << std::endl;
      while (enemy->isAlive() && player->isAlive()) {
        enemy->AskQuestion();
        enemy->checkAnswer(player);
        if (!player->isAlive()) {
          std::cerr << "You are dead" << std::endl;
        }
      }
    }
    std::cout << RESET_COLOR << "Ты убил всех драконов, ты победил" << std::endl;
    return 0;
  }
}