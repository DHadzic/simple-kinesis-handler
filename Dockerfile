FROM public.ecr.aws/lambda/nodejs:20 AS builder
WORKDIR /usr/app
COPY package.json ./
RUN npm install --only=production
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:20
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/ ./
CMD ["handler.handler"]