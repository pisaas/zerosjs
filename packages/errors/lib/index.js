const debug = require('debug')('@zerosjs/errors');

function ZerosError (msg, name, code, className, data) {
  msg = msg || 'Error';

  let errors;
  let message;
  let newData;

  if (msg instanceof Error) {
    message = msg.message || 'Error';

    // NOTE (EK): This is typically to handle validation errors
    if (msg.errors) {
      errors = msg.errors;
    }
  } else if (typeof msg === 'object') { // Support plain old objects
    message = msg.message || 'Error';
    data = msg;
  } else { // message is just a string
    message = msg;
  }

  if (data) {
    // NOTE(EK): To make sure that we are not messing
    // with immutable data, just make a copy.
    newData = JSON.parse(JSON.stringify(data));

    if (newData.errors) {
      errors = newData.errors;
      delete newData.errors;
    } else if (data.errors) {
      // The errors property from data could be
      // stripped away while cloning resulting newData not to have it
      // For example: when cloning arrays this property
      errors = JSON.parse(JSON.stringify(data.errors));
    }
  }

  // NOTE (EK): Babel doesn't support this so
  // we have to pass in the class name manually.
  // this.name = this.constructor.name;
  this.type = 'ZerosError';
  this.name = name;
  this.message = message;
  this.code = code;
  this.className = className;
  this.data = newData;
  this.errors = errors || {};

  debug(`${this.name}(${this.code}): ${this.message}`);
  debug(this.errors);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, ZerosError);
  } else {
    this.stack = (new Error()).stack;
  }
}

function inheritsFrom (Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

inheritsFrom(ZerosError, Error);

// NOTE (EK): A little hack to get around `message` not
// being included in the default toJSON call.
Object.defineProperty(ZerosError.prototype, 'toJSON', {
  value: function () {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      className: this.className,
      data: this.data,
      errors: this.errors
    };
  }
});

// 400 - Bad Request
function BadRequest (message, data) {
  ZerosError.call(this, message, 'BadRequest', 400, 'bad-request', data);
}

inheritsFrom(BadRequest, ZerosError);

// 401 - Not Authenticated
function NotAuthenticated (message, data) {
  ZerosError.call(this, message, 'NotAuthenticated', 401, 'not-authenticated', data);
}

inheritsFrom(NotAuthenticated, ZerosError);

// 402 - Payment Error
function PaymentError (message, data) {
  ZerosError.call(this, message, 'PaymentError', 402, 'payment-error', data);
}

inheritsFrom(PaymentError, ZerosError);

// 403 - Forbidden
function Forbidden (message, data) {
  ZerosError.call(this, message, 'Forbidden', 403, 'forbidden', data);
}

inheritsFrom(Forbidden, ZerosError);

// 404 - Not Found
function NotFound (message, data) {
  ZerosError.call(this, message, 'NotFound', 404, 'not-found', data);
}

inheritsFrom(NotFound, ZerosError);

// 405 - Method Not Allowed
function MethodNotAllowed (message, data) {
  ZerosError.call(this, message, 'MethodNotAllowed', 405, 'method-not-allowed', data);
}

inheritsFrom(MethodNotAllowed, ZerosError);

// 406 - Not Acceptable
function NotAcceptable (message, data) {
  ZerosError.call(this, message, 'NotAcceptable', 406, 'not-acceptable', data);
}

inheritsFrom(NotAcceptable, ZerosError);

// 408 - Timeout
function Timeout (message, data) {
  ZerosError.call(this, message, 'Timeout', 408, 'timeout', data);
}

inheritsFrom(Timeout, ZerosError);

// 409 - Conflict
function Conflict (message, data) {
  ZerosError.call(this, message, 'Conflict', 409, 'conflict', data);
}

inheritsFrom(Conflict, ZerosError);

// 411 - Length Required
function LengthRequired (message, data) {
  ZerosError.call(this, message, 'LengthRequired', 411, 'length-required', data);
}

inheritsFrom(LengthRequired, ZerosError);

// 422 Unprocessable
function Unprocessable (message, data) {
  ZerosError.call(this, message, 'Unprocessable', 422, 'unprocessable', data);
}

inheritsFrom(Unprocessable, ZerosError);

// 429 Too Many Requests
function TooManyRequests (message, data) {
  ZerosError.call(this, message, 'TooManyRequests', 429, 'too-many-requests', data);
}

inheritsFrom(TooManyRequests, ZerosError);

// 500 - General Error
function GeneralError (message, data) {
  ZerosError.call(this, message, 'GeneralError', 500, 'general-error', data);
}

inheritsFrom(GeneralError, ZerosError);

// 501 - Not Implemented
function NotImplemented (message, data) {
  ZerosError.call(this, message, 'NotImplemented', 501, 'not-implemented', data);
}

inheritsFrom(NotImplemented, ZerosError);

// 502 - Bad Gateway
function BadGateway (message, data) {
  ZerosError.call(this, message, 'BadGateway', 502, 'bad-gateway', data);
}

inheritsFrom(BadGateway, ZerosError);

// 503 - Unavailable
function Unavailable (message, data) {
  ZerosError.call(this, message, 'Unavailable', 503, 'unavailable', data);
}

inheritsFrom(Unavailable, ZerosError);

// 509 - InnerError 不对外报错
function InnerError (message, data) {
  ZerosError.call(this, message, 'InnerError', 509, 'inner-error', data);
}

inheritsFrom(InnerError, ZerosError);

const errors = {
  ZerosError,
  BadRequest,
  NotAuthenticated,
  PaymentError,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  Timeout,
  Conflict,
  LengthRequired,
  Unprocessable,
  TooManyRequests,
  GeneralError,
  NotImplemented,
  BadGateway,
  Unavailable,
  InnerError,
  400: BadRequest,
  401: NotAuthenticated,
  402: PaymentError,
  403: Forbidden,
  404: NotFound,
  405: MethodNotAllowed,
  406: NotAcceptable,
  408: Timeout,
  409: Conflict,
  411: LengthRequired,
  422: Unprocessable,
  429: TooManyRequests,
  500: GeneralError,
  501: NotImplemented,
  502: BadGateway,
  503: Unavailable,
  509: InnerError,
};

function convert (error) {
  if (!error) {
    return error;
  }

  const ZerosError = errors[error.name];
  const result = ZerosError
    ? new ZerosError(error.message, error.data)
    : new Error(error.message || error);

  if (typeof error === 'object') {
    Object.assign(result, error);
  }

  return result;
}

module.exports = Object.assign({ convert }, errors);
