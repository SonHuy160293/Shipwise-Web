---
version: alpha
name: Shipwise
colors:
  background: '#FFFFFF'
  foreground: '#17324D'
  card: '#FFFFFF'
  primary: '#17324D'
  primary-foreground: '#FFFFFF'
  secondary: '#F5F7F9'
  accent: '#DDF4FF'
  muted: '#F5F7F9'
  muted-foreground: '#586575'
  border: '#E5E7EB'
  input: '#E5E7EB'
  ring: '#276488'
  destructive: '#B42318'
typography:
  page-title:
    fontFamily: Geist Variable
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.025em
  section-title:
    fontFamily: Geist Variable
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
  card-title:
    fontFamily: Geist Variable
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: Geist Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: Geist Variable
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  helper:
    fontFamily: Geist Variable
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.65
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
spacing:
  base: 4px
  sm: 8px
  md: 16px
  gutter: 24px
  lg: 32px
  xl: 40px
components:
  canvas:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.sm}'
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.foreground}'
  navigation-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.foreground}'
  helper:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.muted-foreground}'
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
  divider:
    backgroundColor: '{colors.border}'
  input-border:
    backgroundColor: '{colors.input}'
  focus-indicator:
    backgroundColor: '{colors.ring}'
  error:
    backgroundColor: '{colors.background}'
    textColor: '{colors.destructive}'
---

# Shipwise Design System

## Overview

Professional, calm, minimal SaaS for software delivery teams. Optimize task clarity and restrained enterprise UI. Product capabilities are planned; the foundation must not imply live data.

## Colors

White canvas, navbar, sidebar and cards. Navy #17324D for headings, icons and primary actions. Light Blue #DDF4FF only for selected navigation and limited highlights. Neutral muted surfaces support secondary controls. Border #E5E7EB. Tokens in src/styles/globals.css implement these values; card/accent foregrounds use navy. Ring and destructive tokens provide semantic feedback.

## Typography

Self-host Geist through Fontsource. Page titles 30/36 semibold, section titles 20/28, card titles 18/27, body and table content 14/24, labels 14/21 medium, helper text 12/20. Keep paragraphs short and line length controlled. Use tabular numbers for future tables.

## Layout

Tailwind's 4px base spacing with 8, 16, 24, 32 and 40px steps. Content uses 20px mobile and 40px desktop gutters, max width 1152px. Navbar 72px. Sidebar 240px expanded and 80px collapsed. Below 768px, use a modal navigation drawer with focus trapping, Escape dismissal and focus restoration.

## Elevation & Depth

Thin borders define white surfaces. No card shadows; only minimal overlay elevation inherited from shadcn. No decorative animation. Respect reduced-motion preferences.

## Shapes

6px controls, 8px standard radius, 12px cards, 16px only when justified. Avatar circles are reserved for people/account placeholders.

## Components

Use shadcn primitives in components/ui. Compose navigation, PageContainer and PageHeader from components/layout. Empty states explain future availability without fake buttons. Primary and icon buttons have 44px touch targets. Inputs have persistent labels and linked helper/error messages. Loading uses role=status; errors use role=alert. Never communicate status with color alone.

## Do's and Don'ts

Preserve approved colors. Reuse semantic Tailwind utilities. Do not introduce gradients, glassmorphism, blue-filled cards, excessive shadows or decorative icons. Keep keyboard focus visible and all navigation accessible. Update both this file and CSS when changing tokens; run design lint and browser checks. Design lint validates the specification, not the rendered application's WCAG conformance.
