---
layout: archive
permalink: /projects/
title: "Projects"
author_profile: true
page_class: "archive--projects-cards"
---

<section class="home-section projects-section">
  <div class="home-section__header">
    <h2>Three examples that show how I build analytics products</h2>
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

    <article class="featured-card project-card project-card--sand">
      <p class="featured-card__kicker">Published research</p>
      <h3>Signal Pattern Discovery in Python</h3>
      <p>Designed an automated workflow for identifying stronger signal bands from power spectra, replacing fixed heuristics with a more objective method.</p>

      <ul class="project-card__list">
        <li>Created a data-driven process that outperformed standard band boundaries by roughly 2x.</li>
        <li>Focused the work on flexible signal discovery rather than hard-coded assumptions.</li>
        <li>Turned the analysis into a publishable research output with a production-quality Python workflow behind it.</li>
      </ul>

      <div class="project-card__footer">
        <div class="home-chip-row">
          <span class="home-chip">Python</span>
          <span class="home-chip">Signal processing</span>
          <span class="home-chip">Data analysis</span>
          <span class="home-chip">Research methods</span>
        </div>
        <a href="https://www.mdpi.com/1424-8220/22/8/3048" class="featured-card__link" target="_blank" rel="noopener">Read publication</a>
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
