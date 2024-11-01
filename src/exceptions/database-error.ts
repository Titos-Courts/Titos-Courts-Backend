export class DatabaseError extends Error {
  processName: any;

  constructor(processName: any, message: string) {
    super(message);
    this.name = 'DatabaseError';
    this.processName = processName;
  }
}
