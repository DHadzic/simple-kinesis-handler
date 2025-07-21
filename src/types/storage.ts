import { UserLimit } from './user-limit';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

export abstract class AbstractStorage {
  abstract get(key: string): Promise<UserLimit> | UserLimit;
  abstract set(key: string, value: UserLimit): Promise<void> | void;
  abstract delete(key: string): Promise<void> | void;
  abstract has(key: string): Promise<boolean> | boolean;
}

export class MapStorage extends AbstractStorage {
  private storage = new Map<string, UserLimit>();

  get(key: string): UserLimit {
    const value = this.storage.get(key);

    if (!value) {
      throw new Error(`No value found for key: ${key}`);
    }

    return value;
  }

  set(key: string, value: UserLimit): void {
    // Not to reference the same object in memory
    this.storage.set(key, { ...value });
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }
}

export class DynamoStorage extends AbstractStorage {
  private client: DynamoDBDocumentClient;
  private readonly TABLE_NAME: string;

  constructor() {
    super();

    const { REGION, TABLE_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
      this.validateEnvironmentVariables();

    this.TABLE_NAME = TABLE_NAME;
    const config: DynamoDBClientConfig = {
      region: REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    };

    const client = new DynamoDBClient(config);
    this.client = DynamoDBDocumentClient.from(client);
  }

  private validateEnvironmentVariables(): {
    REGION: string;
    TABLE_NAME: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
  } {
    const { REGION, TABLE_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

    const unsetVars = [REGION, TABLE_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY].filter(
      (value) => value === undefined
    );

    if (unsetVars.length) {
      throw new Error(`DynamoDB Environment variable < ${unsetVars.join(', ')} > are not set`);
    }

    return {
      REGION: REGION!,
      TABLE_NAME: TABLE_NAME!,
      AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID!,
      AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY!,
    };
  }

  async get(key: string): Promise<UserLimit> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.TABLE_NAME,
        Key: { userId: key },
      })
    );

    if (!result.Item) {
      throw new Error(`UserLimit not found for key: ${key}`);
    }

    return result.Item as UserLimit;
  }

  async set(key: string, value: UserLimit): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.TABLE_NAME,
        Item: { ...value, userId: key },
      })
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.TABLE_NAME,
        Key: { userId: key },
      })
    );
  }

  async has(key: string): Promise<boolean> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.TABLE_NAME,
        Key: { userId: key },
        ProjectionExpression: 'userId',
      })
    );

    return !!result.Item;
  }
}
