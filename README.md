# AWS Kinesis Event Handler Assignment

A simple TypeScript implementation for processing AWS Kinesis Stream events

## Overview

This project demonstrates a custom AWS Kinesis event handler that processes three main event types:

- User Limit Created
- User Limit Progress Changed
- User Limit Reset

## Technologies Used

- TypeScript
- AWS Lambda
- AWS Kinesis

## Structure

```
├── src/
│   ├── common/       # Shared utilities
│   ├── data/         # Sample event data
│   ├── handlers/     # Event handlers for different event types
│   ├── types/        # TypeScript type definitions
│   ├── handler.ts    # Lambda handler
│   └── index.ts      # Entry point for local demo execution
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

## Deployment

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
