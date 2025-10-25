
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const operation = context.operation.toUpperCase();
    const message = `FirestoreError: Missing or insufficient permissions: The following ${operation} request on path "${context.path}" was denied by Firestore Security Rules.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error object serializable for the Next.js dev overlay
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
