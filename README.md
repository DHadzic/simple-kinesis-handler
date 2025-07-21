# Simple AWS Lambda handler for AWS Kinesis Event Stream

A simple AWS Lambda implementation for processing AWS Kinesis Stream events

## Table of Contents

- [Overview](#overview)
  - [Supported Event Types](#supported-event-types)
  - [Technical Implementation](#technical-implementation)
- [Technologies Used](#technologies-used)
- [Structure](#structure)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Features](#features)
- [Storage Configuration](#storage-configuration)
- [Docker Deployment](#docker-deployment)
  - [Building the Docker Image](#building-the-docker-image)
  - [Running the Container Locally](#running-the-container-locally)
  - [Deploying to AWS Lambda Container Registry](#deploying-to-aws-lambda-container-registry)
- [CLI Deployment](#cli-deployment)
  - [Creating Lambda Deployment Package](#creating-lambda-deployment-package)
  - [AWS Lambda Deployment (via AWS CLI)](#aws-lambda-deployment-via-aws-cli)
  - [Configuring Kinesis as Event Source](#configuring-kinesis-as-event-source)
- [Questions and Answers](#questions-and-answers)

## Overview

This project implements a robust AWS Lambda function that processes events from an AWS Kinesis data stream. It's designed to handle user limit-related events for a gaming or betting platform.

### Supported Event Types

The handler processes three main types of events:

- **User Limit Created**: When a new spending/betting limit is established for a user
- **User Limit Progress Changed**: When a user's activity affects their progress
- **User Limit Reset**: When a user's limit is reset

### Technical Implementation

The solution demonstrates:
- Design with separate handlers for different event types
- Flexible storage options
- Container-ready deployment for AWS Lambda
- CLI Deployment for AWS Lambda
- Error handling and failure upon invalid event processing
- Unit tests with Jest

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

## Questions and Answers

### 1. What did you like about the task and what didn't? Can we improve it and how?

**What I liked:**
- It's realistic and practical. The solution can be deployed into a real system.
- The task seems trivial at first glance, but can be covered in-depth:
  - Various ways to deploy
  - Various ways to handle potential failures

**What could be improved:**
- More clarity around the acceptance criteria:
  - What should be tested (input data that validates the solution)
  - How should the solution behave in specific scenarios (invalid event data, unregistered event type)
  - What is the business logic behind these events
    - Is one user limit always bound to a single currency
    - How do we calculate progress
    - Does remaining amount affect calculation of the progress
- Include schemas for the event structure for easier understanding of event payload
- Examples with processing a couple of events in sequence

### 2. If you were asked to change it so the UserLimit entries are stored on a database with a primary goal to provide them back to the front-end for display, which one would you suggest and why? What sub-tasks would you see as necessary if you were asked to write a story for such a change?

Amazon DynamoDB would be a strong choice:
- Different event type payloads fit well into a single document structure
- Fast reads which is important for front-end applications
- Highly scalable and well-suited for this use case
- Supports stream triggers, which works well with event-driven architecture
- Well integrated with Lambda functions

A generic approach is already in place; we just need to refine it to suit the entity and provide proper DynamoDB configuration to AWS Lambda.

**Sub-tasks for the story:**
- Replace DynamoStorage with a repository interface (UserLimitRepository)
  - Make it specific to the entity
- Investigate a way to provide data to AWS Lambda (credentials might be accessible via IAM role)
- Refactor DynamoDB environment variables and test their passing to AWS Lambda function
- Add indexes for efficient querying by userId

### 3. What would you suggest for an API to return this data to the front-end for a user? What would be the API signature?

**REST API suggestion:**

- `GET /user-limits/:userId`

**Response example:**

```json
{
  "userId": "userId",
  "currencyCode": "SEK",
  "progress": "100",
  "value": "100",
  "status": "ACTIVE",
  "period": "DAY",
}
```

### 4. How did/could you implement it so it's possible to re-use it for other similar use cases?

**Storage:**
- There's already an implementation of AbstractStorage that we work with. There are two implementations of this class - DynamoStorage and MapStorage. For further expansion, there should be a StorageFactory that, based on specific conditions, provides an instance of the AbstractStorage to work with.

**Additional event types:**
- For each new event type that needs a handler, the following should be done:
  - Addition of that specific event type to the eventTypes enumeration
  - Creation of a new handler function in `/src/handlers/`
  - Addition of the handler to the map in `/handler.ts`. The key is the enum value of the event type, and the value is the new handler function
  - Tests for the newly introduced handler in `/test/handlers/`

This could be improved with a class-based EventProcessor rather than a simple map definition for more complex systems.
