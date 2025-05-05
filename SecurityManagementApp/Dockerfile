FROM debian:bullseye-slim AS builder

ENV GRADLE_VERSION=8.5 \
    JAVA_VERSION=17 \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y curl unzip zip git wget openjdk-17-jdk ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -P /tmp && \
    unzip -d /opt/gradle /tmp/gradle-${GRADLE_VERSION}-bin.zip && \
    ln -s /opt/gradle/gradle-${GRADLE_VERSION}/bin/gradle /usr/bin/gradle

WORKDIR /app
COPY . .

RUN gradle build -x test --no-daemon

# Étape 2 : Image finale
FROM openjdk:17-slim

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
