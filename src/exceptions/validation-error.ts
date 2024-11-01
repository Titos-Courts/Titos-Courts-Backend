export class ValidationError extends Error {
  processName: any;

  constructor(processName: any, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.processName = processName;
  }
}
