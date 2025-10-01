import mongoose from "mongoose";

function conflictError(message: string): Error {
  const error = new Error(message);
  error.name = 'ConflictError';
  return error;
}

function isConflictError(err: unknown): boolean {
  return err instanceof Error && err.name === 'ConflictError';
}

async function withRetry<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
  maxRetries = 10
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await operation(session);
      });
      await session.endSession();
      if (result !== undefined) return result;
      throw new Error("Transaction yielded no result");
    } catch (err: unknown) {
      await session.endSession();
      if (isConflictError(err)) throw err;
      if (err instanceof Error && err.message === "RETRY") {
        attempt += 1;
      } else {
        throw err;
      }
    }
  }
  throw conflictError("Could not complete operation after several retries");
}

export { conflictError, withRetry };
