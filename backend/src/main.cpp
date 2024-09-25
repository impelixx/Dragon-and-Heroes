#include <iostream>
#include <string>
#include <random>
#include <chrono>
#include <vector>
#include <algorithm>
#include "json.h"
#include "cpphttplib.h"

using json = nlohmann::json;

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
  virtual json checkAnswer(Attacker* player, int userAnswer) = 0;
  virtual void SetAnswer(int answer) = 0;
  virtual json AskQuestion(int maxNum) = 0;

protected:
  std::string name_;
  int answer_;
  std::string question_;
};

class RedDragon : public Enemy {
public:
  RedDragon() : Enemy(100, 10, "Красный") {}
    json checkAnswer(Attacker* player, int userAnswer) override {
        json response;
        if (userAnswer == answer_) {
            player->attack(this);
            response["result"] = "correct";
            response["message"] = name_ + " дракон не смог увернуться, ты нанес ему удар.";
            response["enemy_health"] = health_;
        } else {
            this->attack(player);
            response["result"] = "wrong";
            response["message"] = "Неправильно " + name_ + " дракон нанес тебе удар";
            response["player_health"] = player->getHealth();
        }
        return response;
    }

    json AskQuestion(int maxNum) override {
        int num1 = rand() % maxNum;
        int num2 = rand() % maxNum;
        SetAnswer(num1 + num2);
        json questionJson;
        std::cout << num1 << " + " << num2 << " = " << num1 + num2 << std::endl;
        questionJson["question"] = name_ + " дракон спрашивает сколько будет " + std::to_string(num1) + " + " + std::to_string(num2) + " = ";
        questionJson["dragon"] = "Red";
        return questionJson;
    }
  void SetAnswer(int answer) override {
    answer_ = answer;
  }
};

class GreenDragon : public Enemy {
public:
  GreenDragon() : Enemy(100, 10, "Зеленый") {}
    json checkAnswer(Attacker* player, int userAnswer) override {
        json response;
        if (userAnswer == answer_) {
            player->attack(this);
            response["result"] = "correct";
            response["message"] = name_ + " дракон не смог увернуться, ты нанес ему удар.";
            response["enemy_health"] = health_;
        } else {
            this->attack(player);
            response["result"] = "wrong";
            response["message"] = "Неправильно " + name_ + " дракон нанес тебе удар";
            response["player_health"] = player->getHealth();
        }
        return response;
    }

    json AskQuestion(int maxNum) override {
        int num1 = rand() % maxNum;
        int num2 = rand() % maxNum;
        SetAnswer(num1 - num2);
        json questionJson;
        std::cout << num1 << " - " << num2 << " = " << num1 - num2 << std::endl;
        questionJson["question"] = name_ + " дракон спрашивает сколько будет " + std::to_string(num1) + " - " + std::to_string(num2) + " = ";
        questionJson["dragon"] = "Green";
        return questionJson;
    }
  void SetAnswer(int answer) override {
    answer_ = answer;
  }
};

class BlackDragon : public Enemy {
public:
  BlackDragon() : Enemy(100, 10, "Черный") {}
    json checkAnswer(Attacker* player, int userAnswer) override {
        json response;
        if (userAnswer == answer_) {
            player->attack(this);
            response["result"] = "correct";
            response["message"] = name_ + " дракон не смог увернуться, ты нанес ему удар.";
            response["enemy_health"] = health_;
        } else {
            this->attack(player);
            response["result"] = "wrong";
            response["message"] = "Неправильно " + name_ + " дракон нанес тебе удар";
            response["player_health"] = player->getHealth();
        }
        return response;
    }

    json AskQuestion(int maxNum) override {
        int num1 = rand() % maxNum;
        int num2 = rand() % maxNum;
        SetAnswer(num1 * num2);
        std::cout << num1 << " * " << num2 << " = " << num1 * num2 << std::endl;
        json questionJson;
        questionJson["question"] = name_ + " дракон спрашивает сколько будет " + std::to_string(num1) + " * " + std::to_string(num2) + " = ";
        questionJson["dragon"] = "Black";
        return questionJson;
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

Enemy *k;

void getNewDragon() {
  std::cout << "New Dragon" << std::endl;
  int num = rand() % 3;
  if (num == 0) {
    k = new RedDragon();
  } else if (num == 1) {
    k = new GreenDragon();
  } else {
    k = new BlackDragon();
  }
}
Player* player = nullptr;

int main() {
  httplib::Server svr;
  //std::vector<Enemy*> enemies = {new RedDragon(), new GreenDragon(), new BlackDragon()};
  //std::shuffle(enemies.begin(), enemies.end(), rng);

  getNewDragon();

  svr.set_post_routing_handler([](const auto& req, auto& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Headers", "*");
  });

  svr.Get("/init", [](const httplib::Request &req, httplib::Response &res) {
    player = new Player(); 
    std::cout << "player created"; 
  });

  svr.Get("/get_task", [](const httplib::Request& req, httplib::Response& res) {
      if (req.has_param("difficulty")) {
          int difficulty = std::stoi(req.get_param_value("difficulty"));
          difficulty = std::max(1, difficulty);
          json questionJson = k->AskQuestion(difficulty * 10);
          res.set_content(questionJson.dump(), "application/json");
      } else {
          res.status = 400;
          res.set_content("{\"error\": \"Missing difficulty parameter\"}", "application/json");
      }
  });

  svr.Get("/check_answer", [](const httplib::Request& req, httplib::Response& res) {
  if (req.has_param("answer")) {
      std::string answerStr = req.get_param_value("answer");
      int answer = std::stoi(answerStr);
      std::cout << "Received answer: " << answer << std::endl;
      std::cout << k->getHealth() << std::endl;
      json answerResponse = k->checkAnswer(player, answer);
      res.set_content(answerResponse.dump(), "application/json");
  } else {
      res.status = 400;
      res.set_content("{\"error\": \"Missing answer parameter\"}", "application/json");
  }
  });

  svr.Get("/get_health", [](const httplib::Request&, httplib::Response& res) {
    json healthJson;
    healthJson["health"] = player->getHealth();
    
    res.set_content(healthJson.dump(), "application/json");
  });
  svr.Get("/get_stat", [](const httplib::Request&, httplib::Response& res) {
    json r;
    r["damage"] = 50;
    r["health"] = player->getHealth();
    res.set_content(r.dump(), "application/json");
  });

  svr.Get("/get_name", [](const httplib::Request&, httplib::Response& res) {
    json nameJson;
    nameJson["name"] = k->getName();
    res.set_content(nameJson.dump(), "application/json");
  });

  svr.Get("/kill_dragon", [](const httplib::Request&, httplib::Response& res) {
    if (k->getHealth() <= 0) {
      std::cout << "check" << std::endl;
      getNewDragon();
      res.set_content("{\"result\": \"success\"}", "application/json");
    } else {
      res.set_content("{\"result\": \"fail\"}", "application/json");
    }
  });

  svr.listen("localhost", 3000);

  return 0;
}