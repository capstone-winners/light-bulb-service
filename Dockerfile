FROM ubuntu:bionic

RUN \
  sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list && \
  apt-get update -y && \
  apt-get upgrade -y && \
  apt-get install -y software-properties-common && \
  apt-get install -y curl git htop man vim wget time tmux && \
  apt-get update -y && \
  apt-get upgrade -y && \
  curl -sL https://deb.nodesource.com/setup_12.x | bash && \
  apt-get install -y nodejs

WORKDIR /cap
COPY . .

RUN npm i


