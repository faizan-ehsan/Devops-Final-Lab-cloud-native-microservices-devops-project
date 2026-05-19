const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5004;
const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';

// Middleware
app.use(cors());
app.use(express.json());

// Prometheus Metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestsCounter = new client.Counter({
  name: 'notification_service_http_requests_total',
  help: 'Total HTTP requests received in Notification Service',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
  });
  next();
});

// Historical buffer of sent notifications to show on UI dashboard
const notificationsHistory = [
  {
    id: 'notif_init_1',
    orderId: 'ord_init_1',
    totalAmount: 189,
    message: 'Welcome to the platform! Complete your profile to get a 10% discount coupon.',
    timestamp: new Date(Date.now() - 3600000)
  }
];

let isUsingRabbit = false;

// Connect and Consume RabbitMQ Queue
async function connectAndConsume() {
  try {
    const connection = await amqp.connect(RABBITMQ_URI);
    const channel = await connection.createChannel();
    await channel.assertQueue('order_notifications', { durable: true });
    
    console.log('Notification Service: Connected to RabbitMQ. Listening for events in queue: "order_notifications"');
    isUsingRabbit = true;

    channel.consume('order_notifications', (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log(`[Notification Broker Event Received] Order ID: ${data.orderId} placed for $${data.totalAmount}`);
          
          const newNotif = {
            id: 'notif_' + Date.now(),
            orderId: data.orderId,
            totalAmount: data.totalAmount,
            message: `🎉 Order Confirmation: Your order (ID: ${data.orderId}) for a total of $${data.totalAmount} has been processed successfully!`,
            timestamp: new Date()
          };
          
          notificationsHistory.unshift(newNotif);
          channel.ack(msg);
        } catch (e) {
          console.error('Failed to parse RabbitMQ message content', e);
          channel.nack(msg);
        }
      }
    });
  } catch (err) {
    console.warn('Notification Service: RabbitMQ broker is offline. Awaiting REST webhook notifications.', err.message);
  }
}
connectAndConsume();

// Health Probes for Kubernetes
app.get('/health/liveness', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'notification-service', timestamp: new Date() });
});

app.get('/health/readiness', (req, res) => {
  res.status(200).json({
    status: 'READY',
    broker: isUsingRabbit ? 'RabbitMQ Connected' : 'HTTP REST mode active'
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// REST Endpoints

// Process notification via HTTP directly (failover / testing endpoint)
app.post('/api/notifications', (req, res) => {
  try {
    const { orderId, totalAmount, userId } = req.body;
    
    const message = orderId 
      ? `🎉 Order Confirmation: Your order (ID: ${orderId}) for a total of $${totalAmount || '0'} has been processed successfully!`
      : `⚠️ Security Alert: A login attempt was made for User ID: ${userId || 'unknown'} from a new location.`;

    const newNotif = {
      id: 'notif_' + Date.now(),
      orderId: orderId || null,
      totalAmount: totalAmount || null,
      message,
      timestamp: new Date()
    };

    notificationsHistory.unshift(newNotif);
    console.log(`[Direct HTTP Notification Logged] Order: ${orderId || 'N/A'}`);
    res.status(201).json({ status: 'Sent', notification: newNotif });
  } catch (err) {
    console.error('Error logging direct notification:', err);
    res.status(500).json({ error: 'Server error processing notification' });
  }
});

// Get notification history (Called by UI Dashboard)
app.get('/api/notifications/history', (req, res) => {
  res.status(200).json(notificationsHistory);
});

// Server listener
const server = app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});

module.exports = { app, server };
