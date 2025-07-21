# AWS Kinesis Event Handler Assignment

A simple TypeScript implementation for processing AWS Kinesis Stream events

## Overview

This project implements a robust AWS Lambda function that processes events from an AWS Kinesis data stream. It's designed to handle user limit-related events for a gaming or betting platform.

### Supported Event Types

The handler processes three main types of events:

- **User Limit Created**: When a new spending/betting limit is established for a user
- **User Limit Progress Changed**: When a user's activity affects their progress
- **User Limit Reset**: When a user's limit is reset

### Technical Implementation

The solution demonstrates:
- Modular design with separate handlers for different event types
- Flexible storage options (in-memory for testing, DynamoDB for production)
- Container-ready deployment for AWS Lambda
- CLI Deployment for AWS Lambda
- Comprehensive error handling and batch failure reporting
- Unit and integration tests with Jest

## Technologies Used

- TypeScript
- AWS Lambda
- AWS Kinesis
- Docker

## Structure

```
├── src/
│   ├── common/       # Shared utilities
│   ├── data/         # Sample event data
│   ├── handlers/     # Event handlers for different event types
│   ├── types/        # TypeScript type definitions
│   ├── handler.ts    # Lambda handler
│   └── index.ts      # Entry point for local demo execution
├── test/             # Test files and fixtures
├── Dockerfile        # Docker configuration for Lambda container
├── .dockerignore     # Files to exclude from Docker builds
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## Running the Project

```bash
npm start
```

This command will process sample events from the `src/data/events.json` file through the handler.

## Testing

Run the Jest test suite:

```bash
npm test
```

## Features

- Event-driven architecture for processing user limit events
- In-memory storage for demonstration purposes
- Creation of `lambda.zip` file via script

## Storage Configuration

The application supports two storage types:
- In-memory storage (default)
- DynamoDB storage

Set the storage type using environment variables:

```
ENABLE_DYNAMO_DB=true

# AWS Configuration for DynamoDB
AWS_REGION=
AWS_TABLE_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Docker Deployment

This project includes Docker support for containerized deployment to AWS Lambda.

### Building the Docker Image

```bash
docker build -t kinesis-handler .
```

The Docker build process:
1. Uses AWS Lambda base image for Node.js 20
4. Creates a container ready for AWS Lambda deployment

### Running the Container Locally

```bash
docker run -p 9000:8080 custom-kinesis-handler
```

You can test your Lambda function using the following:

```bash
# Invoke the function with test data
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{...}'
```

### Deploying to AWS Lambda Container Registry

```bash
# Tag the image for your ECR repository
docker tag kinesis-handler:latest $AWS_ECR_REPOSITORY_URI/kinesis-handler:latest

# Push to ECR
docker push $AWS_ECR_REPOSITORY_URI/kinesis-handler:latest
```

Then deploy your Lambda function using the container image URI.

## CLI Deployment

### Creating Lambda Deployment Package

To create a deployment package for AWS Lambda, run:

```bash
npm run create-lambda-zip
```

This script:
1. Builds the TypeScript code
2. Prepares a deployment directory
3. Installs production dependencies
4. Creates a `lambda.zip` file ready for deployment

### AWS Lambda Deployment (via AWS CLI)

Create a new Lambda function:

```bash
aws lambda create-function \
  --function-name custom-kinesis-handler \
  --runtime nodejs20.x \
  --role $AWS_IAM_ROLE \
  --handler handler.handler \
  --zip-file lambda.zip
```

Update an existing Lambda function:

```bash
aws lambda update-function-code \
  --function-name custom-kinesis-handler \
  --zip-file lambda.zip
```

### Configuring Kinesis as Event Source

Connect the Lambda function to a Kinesis stream:

```bash
aws lambda create-event-source-mapping \
  --function-name custom-kinesis-handler \
  --event-source-arn $AWS_EVENT_SOURCE_ARN \
  --batch-size 100 \
  --starting-position LATEST
```
