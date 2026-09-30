using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SocialOps.Api.Shared.Exceptions;

namespace SocialOps.Api.Shared.Errors;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
  private readonly IProblemDetailsService _problemDetailsService;
  private readonly ILogger<GlobalExceptionHandler> _logger;

  public GlobalExceptionHandler(
      IProblemDetailsService problemDetailsService,
      ILogger<GlobalExceptionHandler> logger)
  {
    _problemDetailsService = problemDetailsService;
    _logger = logger;
  }

  public async ValueTask<bool> TryHandleAsync(
      HttpContext httpContext,
      Exception exception,
      CancellationToken cancellationToken)
  {
    if (exception is OperationCanceledException &&
        httpContext.RequestAborted.IsCancellationRequested)
    {
      return false;
    }

    var problemDetails = CreateProblemDetails(httpContext, exception);

    if (problemDetails.Status >= StatusCodes.Status500InternalServerError)
    {
      _logger.LogError(
          exception,
          "Unhandled exception while processing {Method} {Path}. TraceId: {TraceId}",
          httpContext.Request.Method,
          httpContext.Request.Path,
          httpContext.TraceIdentifier);
    }

    httpContext.Response.StatusCode = problemDetails.Status
        ?? StatusCodes.Status500InternalServerError;

    return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
    {
      HttpContext = httpContext,
      ProblemDetails = problemDetails,
      Exception = exception
    });
  }

  private static ProblemDetails CreateProblemDetails(
      HttpContext httpContext,
      Exception exception)
  {
    ProblemDetails problemDetails = exception switch
    {
      ResourceNotFoundException => Create(
          StatusCodes.Status404NotFound,
          "Resource not found",
          exception.Message),
      ConflictException => Create(
          StatusCodes.Status409Conflict,
          "Resource conflict",
          exception.Message),
      BusinessRuleException => Create(
          StatusCodes.Status422UnprocessableEntity,
          "Business rule violation",
          exception.Message),
      ValidationException validationException => CreateValidationProblem(validationException),
      HttpRequestException => Create(
          StatusCodes.Status503ServiceUnavailable,
          "External service unavailable",
          "A required external service is temporarily unavailable."),
      TimeoutException or TaskCanceledException => Create(
          StatusCodes.Status504GatewayTimeout,
          "External service timeout",
          "A required external service did not respond in time."),
      _ => Create(
          StatusCodes.Status500InternalServerError,
          "An unexpected error occurred",
          "The server could not complete the request.")
    };

    problemDetails.Instance = httpContext.Request.Path;
    problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;

    return problemDetails;
  }

  private static ProblemDetails Create(int status, string title, string detail)
  {
    return new ProblemDetails
    {
      Status = status,
      Title = title,
      Detail = detail
    };
  }

  private static HttpValidationProblemDetails CreateValidationProblem(
      ValidationException exception)
  {
    var errors = exception.Errors
        .GroupBy(x => x.PropertyName)
        .ToDictionary(
            group => group.Key,
            group => group.Select(x => x.ErrorMessage).ToArray());

    return new HttpValidationProblemDetails(errors)
    {
      Status = StatusCodes.Status400BadRequest,
      Title = "Validation failed",
      Detail = "One or more validation errors occurred."
    };
  }
}
