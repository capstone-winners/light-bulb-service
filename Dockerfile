FROM ubuntu:bionic

RUN \
  sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list && \
  apt-get update -y && \
  apt-get upgrade -y && \
  apt-get install -y software-properties-common && \
  apt-get install -y curl git htop man vim wget time tmux && \
  apt-get update -y && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*