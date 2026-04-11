# Lightweight image for OpenClaw plugin
# This gets mounted into the OpenClaw extensions directory
FROM node:20-alpine

WORKDIR /plugin

COPY openclaw-plugin-yesboss/ ./

RUN npm install --production || true

# The plugin is loaded by OpenClaw at runtime from this directory
CMD ["echo", "This is a plugin. Mount into OpenClaw's extensions directory."]
