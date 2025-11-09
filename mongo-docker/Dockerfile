# Use the official MongoDB image as base
FROM mongo:6

# Optional: set environment variables for default DB, user, password
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=admin123
ENV MONGO_INITDB_DATABASE=cloudnotes

# Optional: copy any initialization scripts
# COPY ./init-scripts /docker-entrypoint-initdb.d/

# Expose MongoDB port
EXPOSE 27017
