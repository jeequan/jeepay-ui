# syntax = docker/dockerfile:experimental
# 使用了 Docker 特性 Buildx 请开启相关特性

FROM node:16-alpine AS builder

ARG PLATFORM=$PLATFORM

WORKDIR /workspace

COPY . /workspace

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk update
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3

RUN npm config set registry https://registry.npmmirror.com

RUN cd /workspace/jeepay-ui-${PLATFORM} && npm install  && npm run build


FROM nginx:alpine

ARG PLATFORM=$PLATFORM

ENV BACKEND_HOST $BACKEND_HOST

WORKDIR /workspace

COPY --from=builder /workspace/jeepay-ui-${PLATFORM}/dist /workspace
RUN chmod a+r /workspace

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY --from=builder /workspace/default.conf.template /etc/nginx/templates/default.conf.template

# 编译命令
# docker buildx build . --build-arg PLATFORM=cashier -t jeepay-payment:latest
# docker buildx build . --build-arg PLATFORM=manager -t jeepay-manager:latest
# docker buildx build . --build-arg PLATFORM=merchant -t jeepay-merchant:latest
#
# 如果你需要多平台镜像，你可以使用 --platform linux/amd64,linux/arm64
# 比如 docker buildx build . --build-arg PLATFORM=cashier -t jeepay-ui-cashier:latest --platform linux/amd64,linux/arm64
#
# 启动命令
# docker run -d -p 9226:80 -e BACKEND_HOST=172.20.0.9216 jeepay-ui-cashier:latest
# docker run -d -p 9227:80 -e BACKEND_HOST=172.20.0.9217 jeepay-ui-manager:latest
# docker run -d -p 9228:80 -e BACKEND_HOST=172.20.0.9218 jeepay-ui-merchant:latest
