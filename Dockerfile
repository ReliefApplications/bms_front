FROM node:latest

# ARGS
ARG PROJECT_NAME=bms_front
# get default node user : 'node' 
ARG USER=node  
ARG WORKSPACE=/usr/dockers/devapp

# update system
RUN apt-get update

# allow npm to install as root user
#other solution : RUN npm -g install nodegit --unsafe-perm
RUN npm -g config set user root


#install project dependencies
RUN npm install -g @angular/cli@^6.0.8
RUN npm install -g node-sass
RUN apt-get install git
RUN npm -v
RUN ng -v

WORKDIR $WORKSPACE

# copy the check script : do what you want. see below for the call
COPY ./Docker/check-project.sh ./Docker/check-project.sh

##
# Since we are not creating any user here, you need to add the default docker's user
# to your computer by updatinf both following files:
# nano /etc/subuid
# nano /etc/subgid
# https://blog.ippon.tech/docker-and-permission-management/
#
# Exemple of content : 
#  currentUser:1000:65536
#
# add node user
#  node:1000:65536
##
RUN chown -R $USER:$USER $WORKSPACE

USER $USER

RUN npm -g config set user $USER
RUN ls -la
COPY ./package*.json ./
RUN bash Docker/check-project.sh $PROJECT_NAME


EXPOSE 4200