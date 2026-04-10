# AGENTS.md

## Project Overview

This is a Next.js App Router ecommerce project using Shopify as the backend.

The goal is to build fast, conversion-focused, server-rendered storefronts.

---

## Core Principles

* Prefer **server components** by default
* Avoid client-side data fetching
* Keep JavaScript sent to the browser minimal
* Prioritize fast initial render over heavy interactivity
* Build for clarity and simplicity over abstraction

---

## Data Fetching

* All data fetching must happen on the **server**
* Do not use `useEffect` for fetching data
* Shopify API logic must be isolated inside `/lib/shopify`
* Components should never directly call external APIs

---

## Component Guidelines

* Use `"use client"` only when necessary (interactivity, animations)
* Keep components small and reusable
* Separate UI from business logic

---

## Folder Structure

* `/app` → routes and pages
* `/components` → reusable UI components
* `/lib/shopify` → Shopify API logic
* `/lib/utils` → helper functions

---

## Performance Guidelines

* Always render meaningful content on first load
* Avoid blocking the initial render with heavy scripts
* Load animations and non-critical features after content
* Use optimized images and define dimensions

---

## SEO Basics

* Each page must have a proper title and meta description
* Use clean and readable URLs
* Ensure content is server-rendered

---

## Code Style

* Keep code simple and readable
* Avoid unnecessary abstractions
* Prefer explicit logic over clever shortcuts

---

## What to Avoid

* No client-side API calls to Shopify
* No large third-party libraries unless necessary
* No mixing data fetching logic inside UI components
* No overengineering early in the project

---

## Development Approach

* Get data rendering early
* Iterate and optimize later

---

## Goal

Deliver fast, clean, and conversion-focused ecommerce experiences without unnecessary complexity.
