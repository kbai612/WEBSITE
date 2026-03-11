---
layout: archive
permalink: /projects/
title: "Projects"
author_profile: true
page_class: "archive--projects-cards"
---

<section class="home-section projects-section">
  <div class="home-section__header">
    <h2>Four examples that show how I build analytics products</h2>
  </div>

  <div class="featured-work__grid projects-card-grid">
    <article class="featured-card project-card project-card--dark">
      <p class="featured-card__kicker">Retention analytics</p>
      <h3>Retail Customer Churn Prediction and Retention Analytics</h3>
      <p>Built an end-to-end churn system that connects feature engineering, warehouse modeling, explainable machine learning, and a Streamlit dashboard designed for retention action.</p>

      <ul class="project-card__list">
        <li>Compared Logistic Regression, Random Forest, and XGBoost across 25,000 customers and 300,000+ behavioral events.</li>
        <li>Modeled 250,000+ transactions in Snowflake with dbt using a dimensional star schema for RFM, cohorts, and revenue-at-risk reporting.</li>
        <li>Used SHAP to expose top churn drivers and tied the workflow to projected annual savings of $1M-$3.5M.</li>
      </ul>

      <div class="project-card__footer">
        <div class="home-chip-row">
          <span class="home-chip">Python</span>
          <span class="home-chip">Snowflake</span>
          <span class="home-chip">dbt</span>
          <span class="home-chip">XGBoost</span>
          <span class="home-chip">SHAP</span>
          <span class="home-chip">Streamlit</span>
        </div>
        <a href="https://github.com/kbai612/Customer_Churn_Project" class="featured-card__link" target="_blank" rel="noopener">Open GitHub repo</a>
      </div>
    </article>

    <article class="featured-card project-card project-card--mint">
      <p class="featured-card__kicker">Data product build</p>
      <h3>BaiBeta Climbing Shoe Price Tracker</h3>
      <p>Built a full-stack tracking product that ingests Canadian climbing shoe pricing daily and surfaces actionable deals through search, trends, and watchlist alerts.</p>

      <ul class="project-card__list">
        <li>Built and managed a Supabase-backed pricing pipeline in TypeScript, using Prisma models to normalize daily store data and persist historical snapshots for trend analysis.</li>
        <li>Implemented a Next.js App Router experience with filters for brand, store, discount, size, and stock, plus Recharts-based history views so users can validate whether a sale is genuinely attractive.</li>
        <li>Applied CI/CD practices with automated quality checks and deployment workflows, while shipping Auth.js login, watchlists, and deduplicated email alerts to improve reliability and user retention.</li>
      </ul>

      <div class="project-card__footer">
        <div class="home-chip-row">
          <span class="home-chip">Next.js</span>
          <span class="home-chip">TypeScript</span>
          <span class="home-chip">Prisma</span>
          <span class="home-chip">Supabase</span>
          <span class="home-chip">Auth.js</span>
          <span class="home-chip">CI/CD</span>
          <span class="home-chip">Recharts</span>
        </div>
        <a href="https://baibeta.com" class="featured-card__link" target="_blank" rel="noopener">Visit website</a>
      </div>
    </article>

    <article class="featured-card project-card project-card--sand">
      <p class="featured-card__kicker">Reinforcement learning</p>
      <h3>Deep Q-Learning Snake AI</h3>
      <p>Built a Deep Q-Network agent in PyTorch to learn Snake through self-play, with an end-to-end training loop, replay memory, and performance tracking.</p>

      <ul class="project-card__list">
        <li>Engineered an 11-feature state representation for danger detection, direction context, and food position to drive action decisions.</li>
        <li>Implemented experience replay with an epsilon-greedy policy to stabilize learning and improve exploration-to-exploitation balance.</li>
        <li>Trained and evaluated the agent across hundreds of games, showing clear score progression and stronger collision-avoidance behavior.</li>
      </ul>

      <div class="project-card__footer">
        <div class="home-chip-row">
          <span class="home-chip">Python</span>
          <span class="home-chip">PyTorch</span>
          <span class="home-chip">DQN</span>
          <span class="home-chip">Reinforcement Learning</span>
          <span class="home-chip">Pygame</span>
        </div>
        <a href="https://github.com/kbai612/Reinforcement_Learning_Snake" class="featured-card__link" target="_blank" rel="noopener">Open GitHub repo</a>
      </div>
    </article>

    <article class="featured-card project-card project-card--mint">
      <p class="featured-card__kicker">Applied AI build</p>
      <h3>Cerebro-AI</h3>
      <p>Built a local study assistant around retrieval-augmented generation so a user can turn their own material into flashcards, practice prompts, and guided review.</p>

      <ul class="project-card__list">
        <li>Designed a RAG workflow for flashcards, example questions, and content discussion.</li>
        <li>Connected a Google Drive knowledge base to a vector store for efficient retrieval.</li>
        <li>Integrated DeepSeek V3 API support while keeping the system grounded in user-provided study material.</li>
      </ul>

      <div class="project-card__footer">
        <div class="home-chip-row">
          <span class="home-chip">Python</span>
          <span class="home-chip">RAG</span>
          <span class="home-chip">LangChain</span>
          <span class="home-chip">Vector search</span>
        </div>
        <a href="https://github.com/kbai612/Cerebro-AI" class="featured-card__link" target="_blank" rel="noopener">Open GitHub repo</a>
      </div>
    </article>
  </div>
</section>
