# Render has no native Java runtime. Build and run this Spring Boot app in Docker.
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline -DskipTests || true

COPY backend/src src
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
