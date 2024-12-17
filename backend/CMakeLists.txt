cmake_minimum_required(VERSION 3.26)
project(HeroAndDragons)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/src/json/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src/cpp-httplib
)


add_executable(HeroAndDragons src/main.cpp)