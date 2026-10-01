# 构建阶段
# cashier / manager / merchant 均使用 Vue 3 + Vite
FROM node:20-alpine AS builder

ARG PLATFORM

WORKDIR /workspace

COPY . /workspace

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN npm config set registry https://registry.npmmirror.com

RUN cd /workspace/jeepay-ui-${PLATFORM} && npm install && npm run build


# 运行阶段
FROM nginx:alpine

ARG PLATFORM

ENV BACKEND_HOST=${BACKEND_HOST}

WORKDIR /workspace

COPY --from=builder /workspace/jeepay-ui-${PLATFORM}/dist /workspace
RUN chmod -R a+r /workspace

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY --from=builder /workspace/default.conf.template /etc/nginx/templates/default.conf.template

# 编译命令示例
# docker buildx build . --build-arg PLATFORM=cashier -t jeepay-ui-cashier:latest
# docker buildx build . --build-arg PLATFORM=manager -t jeepay-ui-manager:latest
# docker buildx build . --build-arg PLATFORM=merchant -t jeepay-ui-merchant:latest
#
# 启动命令示例
# docker run -d -p 9226:80 -e BACKEND_HOST=172.20.0.21:9216 jeepay-ui-cashier:latest
# docker run -d -p 9227:80 -e BACKEND_HOST=172.20.0.22:9217 jeepay-ui-manager:latest
# docker run -d -p 9228:80 -e BACKEND_HOST=172.20.0.23:9218 jeepay-ui-merchant:latest
