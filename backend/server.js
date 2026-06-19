const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const Event = require('./models/Event');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // For local dev, allow any origin. In production, restrict this.
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/tracker', express.static(path.join(__dirname, '../tracker')));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-analytics';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// APIs

// 1. POST /api/events - Receive event and save
app.post('/api/events', async (req, res) => {
  try {
    const { sessionId, eventType, pageUrl, timestamp, x, y, vw, vh, element } = req.body;

    if (!sessionId || !eventType || !pageUrl) {
      return res.status(400).json({ error: 'sessionId, eventType, and pageUrl are required' });
    }

    const event = new Event({
      sessionId,
      eventType,
      pageUrl,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      x,
      y,
      vw,
      vh,
      element
    });

    await event.save();

    // Broadcast new event to all connected dashboard clients
    io.emit('new_event', event);

    res.status(201).json({ message: 'Event recorded successfully', event });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/sessions - Return list of sessions with aggregation metrics
app.get('/api/sessions', async (req, res) => {
  try {
    const { search, sortBy = 'activity', order = 'desc', startDate, endDate, page = 1, limit = 20 } = req.query;

    const matchStage = {};

    // Date range filter
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Search filter
    if (search) {
      matchStage.$or = [
        { sessionId: { $regex: search, $options: 'i' } },
        { pageUrl: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Grouping pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$sessionId',
          eventCount: { $sum: 1 },
          firstActivity: { $min: '$timestamp' },
          lastActivity: { $max: '$timestamp' },
          pages: { $addToSet: '$pageUrl' }
        }
      },
      {
        $addFields: {
          sessionId: '$_id',
          sessionDuration: {
            $round: [
              { $divide: [{ $subtract: ['$lastActivity', '$firstActivity'] }, 1000] },
              0
            ]
          }
        }
      }
    ];

    // Sorting map
    let sortStage = {};
    if (sortBy === 'duration') {
      sortStage = { sessionDuration: order === 'asc' ? 1 : -1 };
    } else if (sortBy === 'events') {
      sortStage = { eventCount: order === 'asc' ? 1 : -1 };
    } else { // default 'activity'
      sortStage = { lastActivity: order === 'asc' ? 1 : -1 };
    }
    
    pipeline.push({ $sort: sortStage });

    // For pagination count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Event.aggregate(countPipeline);
    const totalSessions = countResult.length > 0 ? countResult[0].total : 0;

    // Paginate results
    pipeline.push({ $skip: skipNum });
    pipeline.push({ $limit: limitNum });

    const sessions = await Event.aggregate(pipeline);

    res.json({
      sessions,
      pagination: {
        total: totalSessions,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalSessions / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. GET /api/sessions/:sessionId - Return ordered user journey
app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const events = await Event.find({ sessionId }).sort({ timestamp: 1 });
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ sessionId, events });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET /api/heatmap - Query by page URL and return click coordinates
app.get('/api/heatmap', async (req, res) => {
  try {
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter is required' });
    }

    const clicks = await Event.find({
      eventType: 'click',
      pageUrl: pageUrl
    }).select('x y vw vh element timestamp');

    res.json({ pageUrl, clicks });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. GET /api/analytics/overview - Aggregated overview metrics
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};

    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchStage.timestamp = { $gte: thirtyDaysAgo };
    }

    // Run aggregations in parallel
    const [overallStats, topPages, eventsOverTime, distribution] = await Promise.all([
      // A. Main KPIs
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            pageViews: { $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] } },
            sessions: { $addToSet: '$sessionId' }
          }
        },
        {
          $project: {
            totalEvents: 1,
            pageViews: 1,
            clicks: 1,
            totalSessions: { $size: '$sessions' },
            _id: 0
          }
        }
      ]),

      // B. Top Pages
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$pageUrl',
            count: { $sum: 1 },
            pageViews: { $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            pageUrl: '$_id',
            count: 1,
            pageViews: 1,
            clicks: 1,
            _id: 0
          }
        }
      ]),

      // C. Events over time
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              eventType: '$eventType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            pageViews: { $sum: { $cond: [{ $eq: ['$_id.eventType', 'page_view'] }, '$count', 0] } },
            clicks: { $sum: { $cond: [{ $eq: ['$_id.eventType', 'click'] }, '$count', 0] } }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            pageViews: 1,
            clicks: 1,
            _id: 0
          }
        }
      ]),

      // D. Event type distribution
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$eventType',
            value: { $sum: 1 }
          }
        },
        {
          $project: {
            name: '$_id',
            value: 1,
            _id: 0
          }
        }
      ])
    ]);

    // Format final structure with fallbacks for empty databases
    const kpis = overallStats[0] || {
      totalEvents: 0,
      pageViews: 0,
      clicks: 0,
      totalSessions: 0
    };

    res.json({
      kpis,
      topPages,
      eventsOverTime,
      distribution: distribution.map(d => ({
        name: d.name === 'page_view' ? 'Page Views' : 'Clicks',
        value: d.value
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server Listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
