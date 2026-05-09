---
name: Design System & Visual Standards
description: Colors, typography, component patterns, and visual conventions for all emails
type: project
---

# Design System — Practical AI Quiz Emails

## Color Palette

| Use | Color | Hex | RGB | Notes |
|-----|-------|-----|-----|-------|
| **Primary CTA** | Gold | #C9A84C | 201, 168, 76 | Buttons, highlights, accents |
| **Primary CTA Hover** | Darker Gold | #b8962f | 184, 150, 47 | Hover state on CTAs |
| **Dark Background** | Navy | #1a1a1a | 26, 26, 26 | Header gradient, text |
| **Light Background** | Cream | #FBF5E3 | 251, 245, 227 | Highlight boxes, accents |
| **Secondary Text** | Dark Gray | #666666 | 102, 102, 102 | Subtext, labels |
| **Body Text** | Charcoal | #333333 | 51, 51, 51 | Main paragraph text |
| **Border Light** | Light Gray | #e0e0e0 | 224, 224, 224 | Subtle borders |

## Typography

### Headlines (Georgia, Serif)
- **H1** (header title): 28px, bold, color: #FFD700 (gold gradient)
- **H2** (section titles): 20px, bold, color: #1a1a1a
- **H3** (box titles): 16px, bold, color: #1a1a1a
- **Framework titles**: 16px, bold, Georgia serif, color: #1a1a1a

### Body Text (System Stack)
- **Paragraph**: 15px, line-height: 1.6, color: #333333
- **Label/Small**: 14px, color: #666666 or #333333
- **Footer/Meta**: 13px, color: #666666

### Font Stack (All non-serif)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
```

## Component Patterns

### 1. Header (All Emails)
```
Gradient: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)
Content:
  - Headshot photo (80×80px, circular, #FFD700 border)
  - H1 title (28px, #FFD700)
  - Subtitle (14px, lighter gray)
Padding: 40px 30px (30px 20px on mobile)
Border bottom: 4px solid #FFD700
Position: relative (for absolute photo positioning)
```

### 2. Highlight Box (Hook/Opening)
```
Background: #FBF5E3 (cream)
Border-left: 4px solid #C9A84C (gold)
Padding: 15px-25px
Margin: 15-25px 0
Italic text: 16px, color: #333333
Strong text: normal style, color: #1a1a1a
Line-height: 1.5
Border-radius: 4px
```

### 3. Content Box (Value/Benefits)
```
Background: #f9f9f9 (light gray)
Border: 1px solid #e0e0e0
Border-left: 4px solid #C9A84C
Padding: 20px
Margin: 15px 0
Border-radius: 4px
Title: 15px bold, #1a1a1a
Text: 14px, #666666
```

### 4. CTA Button
```
Background: #C9A84C (gold)
Color: #1a1a1a (text)
Padding: 12-14px 24-30px
Border-radius: 4px
Font-weight: bold
Font-size: 13-15px
Text-decoration: none
Display: inline-block or block (full width in flex container)
Hover: background #b8962f

Accessibility: No text-decoration on hover, maintain contrast
```

### 5. Research/Info Box
```
Background: #e8f4f8 (light blue)
Border-left: 4px solid #2c3e50 (dark)
Padding: 20px
Margin: 25px 0
Border-radius: 4px
Font-size: 15px
Color: #333333
```

### 6. Testimonial Card
```
Background: #FBF5E3 (cream)
Border-left: 4px solid #C9A84C (gold)
Padding: 20px
Margin: 15px 0
Border-radius: 4px
Quote: 14px, italic, #333333, margin: 0
Credit: 13px, bold, normal style, color: #1a1a1a, margin-top: 10px
```

### 7. Divider
```
Height: 3px
Background-color: #C9A84C (gold)
Margin: 30px 0
```

### 8. Footer
```
Background: #f9f9f9 (light gray)
Padding: 30px
Text-align: left
Border-top: 1px solid #e0e0e0
Font-size: 13px
Color: #666666
P.S. style: conversational, no-hype tone
```

### 9. Signature
```
Margin-top: 20px
Padding-top: 20px
Border-top: 1px solid #e0e0e0
Name: strong, display: block
Title: strong, display: block
Email: link, color: #C9A84C, text-decoration: none
```

## Spacing Standards

| Use | Size |
|-----|------|
| Header padding | 40px 30px (top/bottom × left/right) |
| Content padding | 40px 30px |
| Mobile padding | 30px 20px (header), 25px 20px (content) |
| Margin between sections | 15-25px |
| Margin dividers | 30px 0 |
| Box padding | 15-25px |
| Box margins | 15-25px 0 |

## Mobile Responsiveness

All emails use `@media (max-width: 600px)`:
- Container: margin 0, border-radius 0
- Header: padding 30px 20px
- Content: padding 25px 20px
- H1: font-size 24px (down from 28px)
- Stat numbers: font-size 24px (down from 32px)

## Contrast & Accessibility

- **Body text on white**: #333333 on #ffffff ✅ (WCAG AA)
- **Text on cream**: #333333 on #FBF5E3 ✅ (WCAG AA)
- **Gold buttons**: #1a1a1a on #C9A84C ✅ (WCAG AA)
- **Secondary text**: #666666 on white ✅ (WCAG AA)
- **All hover states**: Maintain minimum 4.5:1 contrast ratio

## Email Platform Considerations

These templates are built to work with:
- **HubSpot** personalization: [Contact Name], [Org Name]
- **Mailchimp** merge tags compatible
- **Campaign Monitor, Klaviyo, etc.**: Standard HTML/CSS (no advanced features needed)

**Limitations to avoid**:
- No: Complex CSS animations, advanced pseudo-selectors
- No: Background images on buttons (some clients don't support)
- Yes: Solid colors, simple borders, standard Google fonts fallback

## Link Styling

- **CTA links**: Styled as buttons (see CTA Button above)
- **Text links**: color #C9A84C, text-decoration: none
- **Email footer links**: color #C9A84C, text-decoration: none

## How to Maintain Design System

When creating new emails based on this system:
1. Use **exact color hex codes** (not CSS variable names)
2. Maintain **40px padding** for content sections
3. Keep **gold borders on the left** of highlight boxes
4. Use **Georgia serif** for all headlines
5. Apply **4px bottom border + #FFD700** to header
6. Use **circular 80×80px headshots** with gold border
7. Maintain **gold CTA buttons** with hover state
8. Test in **Outlook, Gmail, Apple Mail, mobile clients**

## Known Issues & Workarounds

- **Outlook**: May not respect border-radius; use as progressive enhancement
- **Gmail**: Removes some styles; rely on colors + borders, not shadows
- **Mobile**: Always test at 375px width (iPhone SE)
- **Dark mode**: Gold accent text may have lower contrast; use bold weight to compensate
