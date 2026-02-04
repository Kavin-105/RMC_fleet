# Landing Page Assets

Place your transit mixer and fleet images in this folder to replace the placeholder images on the landing page.

## Required Images

| Filename | Dimensions | Description |
|----------|------------|-------------|
| `hero-transit-mixer.jpg` | 800x600px | Main hero section image - showcasing a transit mixer truck |
| `fleet-overview.jpg` | 600x400px | Wide shot of multiple transit mixers in a fleet |
| `live-tracking.jpg` | 600x400px | Screenshot or illustration of GPS tracking on a map |
| `driver-app.jpg` | 400x600px | Mobile app screenshot or driver using the app |
| `dashboard-preview.jpg` | 800x500px | Owner dashboard screenshot with charts and KPIs |
| `truck-1.jpg` | 600x400px | Individual transit mixer photo 1 |
| `truck-2.jpg` | 400x300px | Individual transit mixer photo 2 |
| `truck-3.jpg` | 400x300px | Individual transit mixer photo 3 |

## Recommended Image Specifications

- **Format**: JPG or WebP for better compression
- **Quality**: High resolution (at least 2x for retina displays)
- **Style**: Professional, clean, well-lit industrial photography
- **Theme**: Should match the blue/white color scheme of the application

## Usage

Once you add images to this folder, update the image paths in `src/pages/landing/Landing.jsx`:

```javascript
const IMAGES = {
    hero: '/assets/landing/hero-transit-mixer.jpg',
    fleetOverview: '/assets/landing/fleet-overview.jpg',
    liveTracking: '/assets/landing/live-tracking.jpg',
    // ... etc
};
```

Then update the placeholder divs with actual `<img>` tags in the Landing component.
