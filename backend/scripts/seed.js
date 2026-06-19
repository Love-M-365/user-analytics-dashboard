const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Event = require('../models/Event');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-analytics';

const PAGE_PATHS = ['/home', '/features', '/pricing', '/docs', '/dashboard', '/settings', '/checkout'];

const CLICK_ELEMENTS = {
  '/home': [
    { name: 'button.cta-hero ("Get Started for Free")', x: [550, 750], y: [350, 400] },
    { name: 'a.nav-pricing ("Pricing")', x: [800, 880], y: [25, 45] },
    { name: 'a.nav-docs ("Documentation")', x: [900, 990], y: [25, 45] },
    { name: 'button.login ("Sign In")', x: [1100, 1180], y: [20, 50] }
  ],
  '/features': [
    { name: 'button.tab-security ("Security Features")', x: [200, 350], y: [150, 180] },
    { name: 'button.tab-performance ("Speed Optimization")', x: [370, 520], y: [150, 180] },
    { name: 'button.learn-more ("Read Specs")', x: [600, 720], y: [600, 640] }
  ],
  '/pricing': [
    { name: 'button.buy-pro ("Subscribe to Pro Plan")', x: [450, 600], y: [500, 550] },
    { name: 'button.buy-enterprise ("Contact Sales")', x: [750, 900], y: [500, 550] },
    { name: 'span.billing-toggle ("Annual Billing")', x: [580, 660], y: [180, 210] }
  ],
  '/docs': [
    { name: 'a.sidebar-intro ("Introduction Guide")', x: [50, 180], y: [120, 140] },
    { name: 'a.sidebar-install ("Installation")', x: [50, 180], y: [160, 180] },
    { name: 'button.copy-code ("Copy SDK script")', x: [800, 850], y: [420, 440] }
  ],
  '/dashboard': [
    { name: 'button.export ("Export PDF Report")', x: [1050, 1180], y: [90, 120] },
    { name: 'a.sidebar-settings ("Settings Panel")', x: [30, 150], y: [300, 320] },
    { name: 'div.chart-zoom ("Zoom in on events")', x: [400, 650], y: [250, 400] }
  ],
  '/settings': [
    { name: 'input.username-field ("User Field")', x: [350, 550], y: [200, 230] },
    { name: 'button.save-settings ("Save Preferences")', x: [350, 480], y: [450, 485] },
    { name: 'button.toggle-dark ("Switch Dark Mode")', x: [800, 850], y: [100, 120] }
  ],
  '/checkout': [
    { name: 'input.card-number ("Credit Card")', x: [400, 600], y: [280, 310] },
    { name: 'button.pay-submit ("Complete Purchase")', x: [400, 600], y: [480, 520] }
  ]
};

function getRandomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function seedData() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Seed: Connected to MongoDB.');

    // Clear existing events
    const cleanResult = await Event.deleteMany({});
    console.log(`Seed: Cleared ${cleanResult.deletedCount} existing events.`);

    const eventsToInsert = [];
    const now = new Date();
    
    // We will generate events for the last 14 days
    const totalSessions = 25;
    
    for (let s = 0; s < totalSessions; s++) {
      const sessionId = getRandomSessionId();
      
      // Determine date for this session
      const daysAgo = getRandomRange(0, 13);
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() - daysAgo);
      sessionDate.setHours(getRandomRange(8, 22), getRandomRange(0, 59), getRandomRange(0, 59));

      // Viewport properties
      const vw = 1440;
      const vh = 900;

      // Define how many pages the user will browse in this session (1 to 5 pages)
      const pagesToBrowseCount = getRandomRange(1, 5);
      
      // Select subset of pages in order
      const browsedPages = [];
      let currentPathIndex = 0; // Start at /home or random
      
      for (let p = 0; p < pagesToBrowseCount; p++) {
        if (p === 0) {
          browsedPages.push('/home');
        } else {
          // Navigate to some other page randomly
          const nextPages = PAGE_PATHS.filter(path => path !== browsedPages[p - 1]);
          browsedPages.push(nextPages[getRandomRange(0, nextPages.length - 1)]);
        }
      }

      let eventTimeOffset = 0; // seconds

      for (let p = 0; p < browsedPages.length; p++) {
        const pageUrl = browsedPages[p];
        const pageViewTimestamp = new Date(sessionDate.getTime() + eventTimeOffset * 1000);
        
        // Add page view event
        eventsToInsert.push({
          sessionId,
          eventType: 'page_view',
          pageUrl,
          timestamp: pageViewTimestamp,
          vw,
          vh
        });

        eventTimeOffset += getRandomRange(2, 10);

        // Add 1 to 4 clicks on this page
        const clicksCount = getRandomRange(1, 4);
        const elementsList = CLICK_ELEMENTS[pageUrl] || [];

        for (let c = 0; c < clicksCount; c++) {
          if (elementsList.length === 0) continue;
          
          const targetElement = elementsList[getRandomRange(0, elementsList.length - 1)];
          const clickTimestamp = new Date(sessionDate.getTime() + eventTimeOffset * 1000);
          
          eventsToInsert.push({
            sessionId,
            eventType: 'click',
            pageUrl,
            timestamp: clickTimestamp,
            x: getRandomRange(targetElement.x[0], targetElement.x[1]),
            y: getRandomRange(targetElement.y[0], targetElement.y[1]),
            vw,
            vh,
            element: targetElement.name
          });

          eventTimeOffset += getRandomRange(3, 20);
        }
        
        // Time gap between browsing page transitions
        eventTimeOffset += getRandomRange(15, 60);
      }
    }

    // Insert events
    await Event.insertMany(eventsToInsert);
    console.log(`Seed: Successfully inserted ${eventsToInsert.length} events across ${totalSessions} sessions.`);
    
    mongoose.connection.close();
    console.log('Seed: Closed MongoDB connection.');
  } catch (error) {
    console.error('Seed: Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
