---
doc: scope
status: approved
---

# MakanAgent (Qloo Agentic Hackathon)

One line: Chat your craving, get SG dining picks grounded in real cultural taste.

## The Unique Kernel
Qloo Taste-AI grounding is the differentiator: picks come from Qloo's taste graph (cuisine tags + place entities), not generic LLM vibes. Without Qloo this would be a static list; with Qloo it knows what people actually love.

## Who It's For
Daniel, 31, in Tampines, deciding dinner with friends: one wants halal, one wants spicy, one is vegetarian. Today he scrolls Google Maps stars and guesses.

## The Core Loop
Type craving ("spicy halal dinner near east side") → agent resolves cuisine tags via Qloo → Insights returns ranked places → cards with why-it-matches → eat, come back tomorrow.

## What "Working" Looks Like
Live web app on GitHub Pages: enter Qloo API key once (stored locally), type craving, pick cuisine + dietary filters, see ranked place cards from hackathon.api.qloo.com. Demo mode with sample data when no key.

## The POC Boundary
IN: key input (localStorage), craving box, cuisine chips, halal/veg filters, tag resolve + insights calls, place cards, demo mode, EN UI.
LATER: Malay/Chinese/Tamil UI, location bias, chat history, meal-plan agent loop.
CUT: backend (static only), accounts, payments.
