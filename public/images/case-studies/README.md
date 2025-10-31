# Case Study Images - Quick Reference

## Overview
**Total Images:** 48 images across 8 case studies
**Total Size:** 4.8 MB (uncompressed)
**Source:** Unsplash (copyright-free, commercial use)
**Date:** October 31, 2025
**Status:** Ready for implementation

---

## Directory Structure

```
case-studies/
├── petroverse/         (6 images - Oil & Gas)
├── insure360/          (6 images - Insurance)
├── techcorp/           (6 images - Manufacturing)
├── financeflow/        (6 images - FinTech)
├── healthtech/         (6 images - Healthcare)
├── retailmax/          (6 images - E-commerce)
├── logisticscorp/      (6 images - Logistics)
├── energycorp/         (6 images - Energy)
├── IMAGE_MANIFEST.md   (Detailed image documentation)
└── README.md           (This file)
```

---

## Quick Implementation Guide

### Example Usage in React/Next.js

```jsx
// Featured image example
<Image
  src="/images/case-studies/petroverse/petroverse-featured.jpg"
  alt="Offshore oil rig with advanced monitoring equipment for predictive maintenance"
  width={1200}
  height={800}
  priority
/>

// Solution image example
<Image
  src="/images/case-studies/petroverse/petroverse-solution-dashboard.jpg"
  alt="Predictive maintenance dashboard showing equipment health metrics"
  width={800}
  height={600}
  loading="lazy"
/>
```

### Image Naming Convention
All images follow this pattern:
- **Featured:** `{company}-featured.jpg` (1200x800px)
- **Solutions:** `{company}-solution-{description}.jpg` (800x600px)
- **Results:** `{company}-results-{metric}.jpg` (800x600px)

---

## Case Study Summary

### 1. PETROVERSE (Oil & Gas)
- **Industry:** Predictive maintenance for oil & gas
- **Key Results:** 30% cost reduction, 45% uptime improvement
- **Images:** Featured rig, dashboards, sensors, monitoring, metrics

### 2. INSURE360 (Insurance)
- **Industry:** Claims automation and fraud detection
- **Key Results:** 70% faster processing, 95% fraud accuracy
- **Images:** Office, document scanning, fraud detection, processing

### 3. TECHCORP (Manufacturing)
- **Industry:** Quality control and defect detection
- **Key Results:** 40% quality improvement, 60% defect reduction
- **Images:** Assembly line, computer vision, quality control, defects

### 4. FINANCEFLOW (FinTech)
- **Industry:** Payment fraud detection
- **Key Results:** 75% fewer false positives, 98.5% fraud detection
- **Images:** Fintech office, fraud algorithms, ML models, payments

### 5. HEALTHTECH (Healthcare)
- **Industry:** Medical imaging analysis
- **Key Results:** 85% faster analysis, 97% diagnostic accuracy
- **Images:** Imaging lab, X-rays, MRI scans, diagnostics

### 6. RETAILMAX (E-commerce)
- **Industry:** Personalization and recommendations
- **Key Results:** 35% conversion increase, 28% revenue growth
- **Images:** Fulfillment center, personalization, recommendations, shopping

### 7. LOGISTICSCORP (Logistics)
- **Industry:** Route optimization and delivery
- **Key Results:** 25% mile reduction, 20% fuel savings
- **Images:** Warehouse, route maps, GPS tracking, delivery trucks

### 8. ENERGYCORP (Energy)
- **Industry:** Smart grid and demand forecasting
- **Key Results:** 40% forecast accuracy, 15% waste reduction
- **Images:** Renewable energy, smart grid, forecasting, analytics

---

## Next Steps

1. **Optimize images** (compress with TinyPNG/ImageOptim)
2. **Generate WebP versions** for modern browsers
3. **Create responsive variants** (mobile: 600x400px)
4. **Implement lazy loading** for performance
5. **Add to case study pages** using paths from manifest
6. **Test performance** with Lighthouse

---

## License Information

- **Source:** Unsplash
- **License:** Unsplash License (free commercial use)
- **Attribution:** Not required
- **Modifications:** Allowed

For detailed image metadata, alt text, and usage recommendations, see **IMAGE_MANIFEST.md**.
