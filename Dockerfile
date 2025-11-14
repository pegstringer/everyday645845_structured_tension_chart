# Build stage - using nginx alpine for small image size
FROM nginx:alpine

# Remove default nginx config and website
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY manifest.webmanifest /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 8080 (Cloud Run standard)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
