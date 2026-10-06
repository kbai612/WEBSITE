# Kevin Bai
**Personal website for to showcase experience, personal projects and interests.**

The homepage includes Kevin’s AI assistant. See [chatbot setup and operation](docs/chatbot.md)
for backend deployment, profile updates, and private conversation review.

## Run locally

### Ruby / Jekyll

Install Ruby with Devkit, then run the following commands from the project directory:

```powershell
gem install bundler
bundle install
bundle exec jekyll serve --watch --livereload
```

Open [http://localhost:4000](http://localhost:4000) in your browser. The site rebuilds and reloads automatically when files change.

### Docker

With Docker Desktop installed and running, start the site with:

```powershell
docker compose up --build
```

Open [http://localhost:4000](http://localhost:4000) in your browser. Press `Ctrl+C` to stop the running container, or use:

```powershell
docker compose down
```



