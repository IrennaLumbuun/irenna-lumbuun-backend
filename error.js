/* Got this code from https://dev.to/lvidakovic/handling-custom-error-types-in-express-js-1k90 */

function attachResponder(req, res, next) {
  res.respond = createResponder(req, res, next);
  next();
}

function createResponder(req, res, next) {
  const responder = {
    _forwardError(error, ErrorClass = Error, data) {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorToForward = new ErrorClass(errorMessage, data);
      // forwards error to an error handler middleware
      next(errorToForward);
    },

    badRequest(error, data) {
      return responder._forwardError(error, HttpBadRequest, data);
    },
    notFound(error, data) {
      return responder._forwardError(error, HttpNotFound, data);
    },
    internalServerError(error, data) {
      return responder._forwardError(error, HttpInternalServer, data);
    }
  };

  return responder;
}

function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json(error.data)
  } else {
    res.sendStatus(httpResponseCodes.INTERNAL_SERVER_ERROR)
  }
}
