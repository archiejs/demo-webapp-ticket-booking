FROM node:6.3.1-wheezy
MAINTAINER Naval Saini <navalnovel@gmail.com>

# env vars
ENV PORT=8080

# create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install app dependencies
COPY package.json /usr/src/app/

RUN npm install --unsafe-perm || \
  ((if [ -f npm-debug.log ]; then \
      cat npm-debug.log; \
    fi) && false)

# Bundle app source
ADD . /usr/src/app

EXPOSE $PORT
CMD [ "npm", "start" ]
