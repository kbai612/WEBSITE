# Base image: Ruby with necessary dependencies for Jekyll
FROM ruby:3.2

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# The repository intentionally does not commit a lockfile, so install from the
# shared Gemfile used by GitHub Pages and the local development container.
COPY Gemfile ./

# Install bundler and dependencies
RUN gem install bundler:2.3.26 && bundle install

# Command to serve the Jekyll site
CMD ["bundle", "exec", "jekyll", "serve", "-H", "0.0.0.0", "-w", "--livereload", "--config", "_config.yml,_config_docker.yml"]
