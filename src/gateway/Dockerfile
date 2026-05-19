FROM nginx:alpine

# Remove default boilerplate configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom reverse proxy routing rules
COPY nginx.conf /etc/nginx/conf.d/

# Expose centralized entrypoint port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
