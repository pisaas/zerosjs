export interface ZeroErrorJSON {
  readonly name: string;
  readonly message: string;
  readonly code: number;
  readonly className: string;
  readonly data: any;
  readonly errors: any;
}

export class ZeroError extends Error {
  readonly code: number;
  readonly className: string;
  readonly data: any;
  readonly errors: any;
  constructor (msg: string | Error, name: string, code: number, className: string, data: any);
  toJSON (): ZeroErrorJSON;
}

export class BadRequest extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class NotAuthenticated extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class PaymentError extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class Forbidden extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class NotFound extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class MethodNotAllowed extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class NotAcceptable extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class Timeout extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class Conflict extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class LengthRequired extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class Unprocessable extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class TooManyRequests extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class GeneralError extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class NotImplemented extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class BadGateway extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export class Unavailable extends ZeroError {
  constructor (msg?: string | Error, data?: any);
}

export interface Errors {
  ZeroError: ZeroError;
  BadRequest: BadRequest;
  NotAuthenticated: NotAuthenticated;
  PaymentError: PaymentError;
  Forbidden: Forbidden;
  NotFound: NotFound;
  MethodNotAllowed: MethodNotAllowed;
  NotAcceptable: NotAcceptable;
  Timeout: Timeout;
  Conflict: Conflict;
  LengthRequired: LengthRequired;
  Unprocessable: Unprocessable;
  TooManyRequests: TooManyRequests;
  GeneralError: GeneralError;
  NotImplemented: NotImplemented;
  BadGateway: BadGateway;
  Unavailable: Unavailable;
}

export function convert (error: any): ZeroError;

export const types: Errors;
export const errors: Errors;
