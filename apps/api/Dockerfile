FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY SocialOps.Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish SocialOps.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# The aspnet image ships a non-root "app" user.
USER app

ENTRYPOINT ["dotnet", "SocialOps.Api.dll"]
