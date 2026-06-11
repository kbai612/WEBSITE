---
layout: archive
permalink: /projects/
title: "Projects"
author_profile: true
page_class: "archive--projects-cards"
---

<section class="v2-projects">
  <div class="v2-project">
    <span class="v2-project__num">01</span>
    <div class="v2-project__body">
      <p class="v2-project__type">Retention analytics</p>
      <h2 class="v2-project__title">Retail Customer Churn Prediction and Retention Analytics</h2>
      <p class="v2-project__desc">Built an end-to-end churn system that connects feature engineering, warehouse modeling, explainable machine learning, and a Streamlit dashboard designed for retention action.</p>
      <ul class="v2-project__list">
        <li>Compared Logistic Regression, Random Forest, and XGBoost across 25,000 customers and 300,000+ behavioral events.</li>
        <li>Modeled 250,000+ transactions in Snowflake with dbt using a dimensional star schema for RFM, cohorts, and revenue-at-risk reporting.</li>
        <li>Used SHAP to expose top churn drivers and tied the workflow to projected annual savings of $1M&ndash;$3.5M.</li>
      </ul>
      <div class="v2-project__footer">
        <span class="v2-project__stack">Python &middot; Snowflake &middot; dbt &middot; XGBoost &middot; SHAP &middot; Streamlit</span>
        <a href="https://github.com/kbai612/Customer_Churn_Project" class="v2-project__link" target="_blank" rel="noopener">Open GitHub repo</a>
      </div>
    </div>
  </div>

  <div class="v2-project">
    <span class="v2-project__num">02</span>
    <div class="v2-project__body">
      <p class="v2-project__type">Data product build</p>
      <h2 class="v2-project__title">BaiBeta Climbing Shoe Price Tracker</h2>
      <p class="v2-project__desc">Built a full-stack tracking product that ingests Canadian climbing shoe pricing daily and surfaces actionable deals through search, trends, and watchlist alerts.</p>
      <ul class="v2-project__list">
        <li>Supabase-backed pricing pipeline in TypeScript with Prisma models to normalize daily store data and persist historical snapshots for trend analysis.</li>
        <li>Next.js App Router experience with filters for brand, store, discount, size, and stock, plus Recharts-based price history views.</li>
        <li>Auth.js login, watchlists, and deduplicated email alerts with CI/CD practices and automated quality checks.</li>
      </ul>
      <div class="v2-project__footer">
        <span class="v2-project__stack">Next.js &middot; TypeScript &middot; Prisma &middot; Supabase &middot; Auth.js &middot; CI/CD</span>
        <a href="https://baibeta.com" class="v2-project__link" target="_blank" rel="noopener">Visit website</a>
      </div>
    </div>
  </div>

  <div class="v2-project">
    <span class="v2-project__num">03</span>
    <div class="v2-project__body">
      <p class="v2-project__type">Reinforcement learning</p>
      <h2 class="v2-project__title">Deep Q-Learning Snake AI</h2>
      <p class="v2-project__desc">Built a Deep Q-Network agent in PyTorch to learn Snake through self-play, with an end-to-end training loop, replay memory, and performance tracking across hundreds of games.</p>
      <ul class="v2-project__list">
        <li>Engineered an 11-feature state representation for danger detection, direction context, and food position to drive action decisions.</li>
        <li>Implemented experience replay with epsilon-greedy policy to stabilize learning and improve exploration-to-exploitation balance.</li>
        <li>Trained and evaluated the agent across hundreds of games, showing clear score progression and stronger collision-avoidance behavior.</li>
      </ul>
      <div class="v2-project__footer">
        <span class="v2-project__stack">Python &middot; PyTorch &middot; DQN &middot; Reinforcement Learning &middot; Pygame</span>
        <a href="https://github.com/kbai612/Reinforcement_Learning_Snake" class="v2-project__link" target="_blank" rel="noopener">Open GitHub repo</a>
      </div>
    </div>
  </div>

  <div class="v2-project">
    <span class="v2-project__num">04</span>
    <div class="v2-project__body">
      <p class="v2-project__type">Applied AI build</p>
      <h2 class="v2-project__title">Cerebro-AI</h2>
      <p class="v2-project__desc">Built a local study assistant around retrieval-augmented generation so users can turn their own material into flashcards, practice prompts, and guided review sessions.</p>
      <ul class="v2-project__list">
        <li>Designed a RAG workflow for flashcards, example questions, and content discussion grounded in user-provided material.</li>
        <li>Connected a Google Drive knowledge base to a vector store for efficient retrieval.</li>
        <li>Integrated DeepSeek V3 API while keeping the system grounded in user-provided study material rather than general world knowledge.</li>
      </ul>
      <div class="v2-project__footer">
        <span class="v2-project__stack">Python &middot; RAG &middot; LangChain &middot; Vector search</span>
        <a href="https://github.com/kbai612/Cerebro-AI" class="v2-project__link" target="_blank" rel="noopener">Open GitHub repo</a>
      </div>
    </div>
  </div>
</section>
