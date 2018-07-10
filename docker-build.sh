#!/bin/bash

TARGET=$1 # ex: project/subproject

# # echo "Delete running containers"
# sudo docker rm $(sudo docker ps -a -q) --force
# # echo "Delete images"
# sudo docker rmi $(sudo docker images -a -q) --force

sudo docker build -t $TARGET -f ./Dockerfile . # --build-arg USER=$2
sudo docker images | grep $TARGET
sudo docker-compose up devapp