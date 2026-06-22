const { createServer } = require('node:http');
const { randomUUID } = require('node:crypto');
const { URL } = require('node:url');
// 1. Mongoose library ko import kiya
const mongoose = require('mongoose'); 

const {
  analytics,
  backups,
  blogs,
  bookings,
  content,
  inquiries,
  notifications,
  processItems,
  products,
  projects,
  reviews,
  security,
  services,
  users,
} = require('./data');

const port = Number(process.env.PORT || 4000);

// 2. MongoDB Connection URI 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/M1T'; 

const siteStoreSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    analytics: mongoose.Schema.Types.Mixed,
    backups: mongoose.Schema.Types.Mixed,
    blogs: mongoose.Schema.Types.Mixed,
    bookings: mongoose.Schema.Types.Mixed,
    content: mongoose.Schema.Types.Mixed,
    inquiries: mongoose.Schema.Types.Mixed,
    notifications: mongoose.Schema.Types.Mixed,
    processItems: mongoose.Schema.Types.Mixed,
    products: mongoose.Schema.Types.Mixed,
    projects: mongoose.Schema.Types.Mixed,
    reviews: mongoose.Schema.Types.Mixed,
    security: mongoose.Schema.Types.Mixed,
    services: mongoose.Schema.Types.Mixed,
    users: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, minimize: false }
);

const SiteStore = mongoose.model('SiteStore', siteStoreSchema);
const activeTokens = new Map();
let saveTimer = null;

let mailTransporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Nodemailer SMTP Transporter configured successfully.');
  } else {
    console.log('SMTP config not fully provided. Falling back to beautifully logged console notifications and database alerts.');
  }
} catch (err) {
  console.log('Error initializing nodemailer:', err.message);
}

async function sendProposalNotification(booking) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@mtiinteriors.com';
  const emailFrom = process.env.SMTP_FROM || 'no-reply@mtiinteriors.com';
  
  const subject = `[MTI Interiors] New Consultation Proposal Request - Reference ${booking.reference}`;
  const textBody = `
Dear Admin,

A new consultation proposal request has been submitted by ${booking.name || 'a client'}.

Request Details:
----------------
Reference: ${booking.reference}
Client Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Consultation Type: ${booking.consultationType}
Date: ${booking.date}
Time: ${booking.time}
Notes: ${booking.notes || 'None'}

Please log in to the MTI Store Admin panel to review and manage this booking.

Best regards,
MTI Interiors Auto-Notification
  `;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1dcd5; border-radius: 8px; background-color: #fdf8f2; color: #2f1b12;">
      <h2 style="border-bottom: 2px solid #c6954f; padding-bottom: 10px; color: #2f1b12; margin-top: 0;">MTI Interiors & Decor</h2>
      <h3 style="color: #c6954f;">New Consultation Proposal Request</h3>
      <p>Dear Admin,</p>
      <p>A new consultation and design proposal has been submitted by <strong>${booking.name || 'a client'}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <tr>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; font-weight: bold; width: 35%;">Reference</td>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; color: #c6954f; font-weight: bold;">${booking.reference}</td>
        </tr>
        <tr>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; font-weight: bold;">Client Name</td>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1;">${booking.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; font-weight: bold;">Email</td>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1;"><a href="mailto:${booking.email}" style="color: #c6954f; text-decoration: none;">${booking.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; font-weight: bold;">Phone</td>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1;">${booking.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; font-weight: bold;">Consultation Type</td>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1;">${booking.consultationType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1; font-weight: bold;">Requested Date</td>
          <td style="padding: 10px 15px; border-bottom: 1px solid #f1ece1;">${booking.date} at ${booking.time}</td>
        </tr>
        <tr>
          <td style="padding: 10px 15px; font-weight: bold; vertical-align: top;">Notes</td>
          <td style="padding: 10px 15px; line-height: 1.5;">${booking.notes || 'No notes provided.'}</td>
        </tr>
      </table>

      <p style="margin-top: 25px;">
        <a href="http://localhost:3000/#admin-workspace" style="display: inline-block; padding: 12px 24px; background-color: #2f1b12; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px; border: 1px solid #c6954f;">
          Open Admin Workspace
        </a>
      </p>
      
      <hr style="border: 0; border-top: 1px solid #e1dcd5; margin: 30px 0 15px 0;" />
      <p style="font-size: 11px; color: #7f746d; text-align: center; margin: 0;">
        MTI Interiors & Decor • Shop No. 11, Tower H, Bahria Heights, Bahria Town Karachi
      </p>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`REALTIME EMAIL NOTIFICATION TRIGGERED:`);
  console.log(`Subject: ${subject}`);
  console.log(`To: ${adminEmail}`);
  console.log(`Content:\n${textBody}`);
  console.log(`======================================================\n`);

  // Create real-time system notification in MTI's internal notifications system
  handleCollectionCreate(notifications, {
    title: `New Proposal Request ${booking.reference}`,
    channel: 'email',
    body: `Consultation proposal booked by ${booking.name} (${booking.consultationType}) for ${booking.date} at ${booking.time}.`,
    active: true,
  }, {
    prefix: 'notification',
    values: { createdAt: new Date().toISOString() }
  });

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: emailFrom,
        to: adminEmail,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`Email successfully sent to ${adminEmail} via SMTP.`);
    } catch (err) {
      console.error(`Failed to send real email via SMTP:`, err.message);
    }
  }
}

function replaceArray(target, source) {
  target.splice(0, target.length, ...(Array.isArray(source) ? source : []));
}

function replaceObject(target, source) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, source || {});
}

function createStoreSnapshot() {
  return {
    key: 'main',
    analytics,
    backups,
    blogs,
    bookings,
    content,
    inquiries,
    notifications,
    processItems,
    products,
    projects,
    reviews,
    security,
    services,
    users,
  };
}

async function hydrateStore() {
  const existing = await SiteStore.findOne({ key: 'main' }).lean();
  if (!existing) {
    await SiteStore.create(createStoreSnapshot());
    return;
  }

  replaceObject(analytics, existing.analytics);
  replaceArray(backups, existing.backups);
  replaceArray(blogs, existing.blogs);
  replaceArray(bookings, existing.bookings);
  replaceObject(content, existing.content);
  replaceArray(inquiries, existing.inquiries);
  replaceArray(notifications, existing.notifications);
  replaceArray(processItems, existing.processItems);
  replaceArray(products, existing.products);
  replaceArray(projects, existing.projects);
  replaceArray(reviews, existing.reviews);
  replaceObject(security, existing.security);
  replaceArray(services, existing.services);
  replaceArray(users, existing.users);

  // Ensure the Super Admin account always exists with correct credentials
  let superadminUser = users.find(u => u.role === 'superadmin' || u.email === 'superadmin@mtiinteriors.com');
  if (!superadminUser) {
    users.unshift({
      id: 'user-super',
      name: 'MTI Super Admin',
      email: 'superadmin@mtiinteriors.com',
      password: 'SuperAdmin123!',
      role: 'superadmin',
      phone: '+92 321 2323611',
      status: 'active',
    });
    queueDatabaseSave();
  } else {
    // Force reset credentials to match requested credentials in case of DB mismatch
    superadminUser.email = 'superadmin@mtiinteriors.com';
    superadminUser.password = 'SuperAdmin123!';
    superadminUser.role = 'superadmin';
    superadminUser.status = 'active';
    queueDatabaseSave();
  }
}

function queueDatabaseSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    SiteStore.findOneAndUpdate(
      { key: 'main' },
      createStoreSnapshot(),
      { upsert: true, new: true }
    ).catch((error) => {
      console.error('Database save failed:', error.message);
    });
  }, 75);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
    });

    request.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    request.on('error', reject);
  });
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function getRequestToken(request) {
  const authHeader = request.headers.authorization || '';
  return authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : '';
}

function getTokenUser(request) {
  const token = getRequestToken(request);
  if (!token || !activeTokens.has(token)) {
    return null;
  }

  return activeTokens.get(token);
}

function requireAuth(request, response) {
  const user = getTokenUser(request);
  if (!user) {
    sendJson(response, 401, { message: 'Authentication required.' });
    return null;
  }

  return user;
}

function requireAdmin(request, response) {
  const user = requireAuth(request, response);
  if (!user) {
    return null;
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    sendJson(response, 403, { message: 'Admin access required.' });
    return null;
  }

  return user;
}

function requireSuperAdmin(request, response) {
  const user = requireAuth(request, response);
  if (!user) {
    return null;
  }

  if (user.role !== 'superadmin') {
    sendJson(response, 403, { message: 'Super Admin access required.' });
    return null;
  }

  return user;
}

function matchCollection(items, search, category) {
  return items.filter((item) => {
    const categoryMatch =
      !category || category === 'All' || item.category === category;
    const searchText = (search || '').toLowerCase();

    if (!searchText) {
      return categoryMatch;
    }

    const haystack = Object.values(item).join(' ').toLowerCase();
    return categoryMatch && haystack.includes(searchText);
  });
}

function findById(items, id) {
  return items.find((item) => item.id === id);
}

function createAdminOverview() {
  return {
    metrics: [
      { label: 'Users', value: String(users.length) },
      { label: 'Bookings', value: String(bookings.length) },
      { label: 'Inquiries', value: String(inquiries.length) },
      { label: 'Projects', value: String(projects.length) },
      { label: 'Products', value: String(products.length) },
      { label: 'Reviews', value: String(reviews.length) },
    ],
    pending: {
      bookings: bookings.filter((item) => item.status === 'pending').length,
      inquiries: inquiries.filter((item) => item.status !== 'resolved').length,
      reviews: reviews.filter((item) => item.approved !== true).length,
    },
    analytics,
    recentBookings: bookings.slice(0, 5),
    recentInquiries: inquiries.slice(0, 5),
  };
}

function createPublicSitePayload() {
  return {
    home: content.home,
    about: content.about,
    contact: content.contact,
    appearance: content.appearance,
    quotationRates: content.quotationRates,
    services,
    processItems,
    projects: projects.filter((item) => item.featured !== false),
    products: products.filter((item) => item.featured !== false),
    reviews: reviews.filter((item) => item.approved === true),
    blogs: blogs.filter((item) => item.published !== false),
  };
}

function handleCollectionCreate(items, payload, defaults = {}) {
  const entry = {
    id: `${defaults.prefix || 'item'}-${randomUUID().slice(0, 8)}`,
    ...defaults.values,
    ...payload,
  };
  items.unshift(entry);
  queueDatabaseSave();
  return entry;
}

function handleCollectionPatch(items, id, payload) {
  const item = findById(items, id);
  if (!item) {
    return null;
  }

  Object.assign(item, payload);
  queueDatabaseSave();
  return item;
}

function handleCollectionDelete(items, id) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  queueDatabaseSave();
  return true;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { pathname, searchParams } = url;
  const method = request.method || 'GET';

  if (method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (method === 'GET' && pathname === '/api/health') {
      sendJson(response, 200, {
        name: 'MTI Interiors and Decor API',
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (method === 'GET' && pathname === '/api/site/public') {
      sendJson(response, 200, createPublicSitePayload());
      return;
    }

    if (method === 'GET' && pathname === '/api/content/home') {
      sendJson(response, 200, content.home);
      return;
    }

    if (method === 'GET' && pathname === '/api/content/contact') {
      sendJson(response, 200, content.contact);
      return;
    }

    if (method === 'GET' && pathname === '/api/services') {
      sendJson(response, 200, { services });
      return;
    }

    if (method === 'GET' && pathname === '/api/process') {
      sendJson(response, 200, { processItems });
      return;
    }

    if (method === 'GET' && pathname === '/api/projects') {
      const category = searchParams.get('category') || '';
      const search = searchParams.get('search') || '';
      sendJson(response, 200, {
        projects: matchCollection(projects, search, category),
      });
      return;
    }

    if (method === 'GET' && pathname === '/api/products') {
      const category = searchParams.get('category') || '';
      const search = searchParams.get('search') || '';
      sendJson(response, 200, {
        products: matchCollection(products, search, category),
      });
      return;
    }

    if (method === 'GET' && pathname === '/api/reviews') {
      sendJson(response, 200, {
        reviews: reviews.filter((review) => review.approved === true),
      });
      return;
    }

    if (method === 'GET' && pathname === '/api/blogs') {
      sendJson(response, 200, {
        blogs: blogs.filter((item) => item.published !== false),
      });
      return;
    }

    if (method === 'POST' && pathname === '/api/reviews') {
      const payload = await parseBody(request);
      const review = handleCollectionCreate(reviews, payload, {
        prefix: 'review',
        values: {
          name: 'Anonymous',
          rating: 5,
          comment: '',
          approved: false,
        },
      });
      review.rating = Number(review.rating || 5);
      sendJson(response, 201, { review });
      return;
    }

    if (method === 'POST' && pathname === '/api/bookings') {
      const payload = await parseBody(request);
      const booking = handleCollectionCreate(bookings, payload, {
        prefix: 'booking',
        values: {
          reference: `MTI-${1000 + bookings.length + 1}`,
          status: 'pending',
          notes: '',
        },
      });
      // Send realtime email notification
      sendProposalNotification(booking).catch((err) => {
        console.error('Failed sending real-time notification:', err.message);
      });
      sendJson(response, 201, { booking });
      return;
    }

    if (method === 'POST' && pathname === '/api/inquiries') {
      const payload = await parseBody(request);
      const inquiry = handleCollectionCreate(inquiries, payload, {
        prefix: 'inquiry',
        values: {
          status: 'new',
          reply: '',
        },
      });
      sendJson(response, 201, { inquiry });
      return;
    }

    if (method === 'POST' && pathname === '/api/auth/register') {
      const payload = await parseBody(request);
      const existingUser = users.find((user) => user.email === payload.email);
      if (existingUser) {
        sendJson(response, 409, { message: 'Email already registered.' });
        return;
      }

      const user = handleCollectionCreate(users, payload, {
        prefix: 'user',
        values: {
          role: 'user',
          status: 'active',
          phone: '',
        },
      });

      sendJson(response, 201, { user: sanitizeUser(user) });
      return;
    }

    if (method === 'POST' && pathname === '/api/auth/login') {
      const payload = await parseBody(request);
      const user = users.find(
        (item) =>
          item.email === payload.email && item.password === payload.password
      );

      if (!user) {
        sendJson(response, 401, { message: 'Invalid email or password.' });
        return;
      }

      const token = randomUUID();
      const sessionUser = sanitizeUser(user);
      activeTokens.set(token, sessionUser);
      sendJson(response, 200, { token, user: sessionUser });
      return;
    }

    if (method === 'POST' && pathname === '/api/auth/google') {
      const payload = await parseBody(request);
      const { credential } = payload;
      if (!credential) {
        sendJson(response, 400, { message: 'Google credential token is required.' });
        return;
      }

      let email = '';
      let name = '';
      try {
        const parts = credential.split('.');
        if (parts.length < 2) {
          throw new Error('Invalid JWT format');
        }
        const decodedStr = Buffer.from(parts[1], 'base64').toString('utf8');
        const decoded = JSON.parse(decodedStr);
        email = decoded.email;
        name = decoded.name || decoded.given_name || 'Google User';
      } catch (err) {
        sendJson(response, 400, { message: 'Invalid Google credential token.' });
        return;
      }

      if (!email) {
        sendJson(response, 400, { message: 'Could not extract email from Google identity.' });
        return;
      }

      let user = users.find((item) => item.email === email);
      if (!user) {
        user = handleCollectionCreate(users, {
          email,
          name,
          phone: '',
          password: randomUUID().slice(0, 12) + '!',
          role: 'user',
          status: 'active',
        }, {
          prefix: 'user',
          values: {}
        });
      }

      if (user.status !== 'active') {
        sendJson(response, 403, { message: 'Your client account is suspended. Please contact MTI staff.' });
        return;
      }

      const token = randomUUID();
      const sessionUser = sanitizeUser(user);
      activeTokens.set(token, sessionUser);
      sendJson(response, 200, { token, user: sessionUser });
      return;
    }

    if (method === 'POST' && pathname === '/api/auth/logout') {
      activeTokens.delete(getRequestToken(request));
      sendJson(response, 200, { message: 'Logged out successfully.' });
      return;
    }

    if (method === 'POST' && pathname === '/api/auth/reset-password') {
      const payload = await parseBody(request);
      sendJson(response, 200, {
        message: `Password reset instructions prepared for ${payload.email || 'the provided address'}.`,
      });
      return;
    }

    if (method === 'POST' && pathname === '/api/auth/change-password') {
      const sessionUser = requireAuth(request, response);
      if (!sessionUser) {
        return;
      }

      const payload = await parseBody(request);
      const user = findById(users, sessionUser.id);
      if (!user) {
        sendJson(response, 404, { message: 'User not found.' });
        return;
      }

      if (user.password !== payload.currentPassword) {
        sendJson(response, 400, { message: 'Current password is incorrect.' });
        return;
      }

      user.password = payload.newPassword || user.password;
      queueDatabaseSave();
      sendJson(response, 200, { message: 'Password updated successfully.' });
      return;
    }

    if (method === 'GET' && pathname === '/api/auth/profile') {
      const user = requireAuth(request, response);
      if (!user) {
        return;
      }

      sendJson(response, 200, { user });
      return;
    }

    if (method === 'PATCH' && pathname === '/api/auth/profile') {
      const sessionUser = requireAuth(request, response);
      if (!sessionUser) {
        return;
      }

      const payload = await parseBody(request);
      const user = findById(users, sessionUser.id);
      if (!user) {
        sendJson(response, 404, { message: 'User not found.' });
        return;
      }

      Object.assign(user, {
        name: payload.name ?? user.name,
        phone: payload.phone ?? user.phone,
      });
      queueDatabaseSave();

      const token = getRequestToken(request);
      const safeUser = sanitizeUser(user);
      if (token) {
        activeTokens.set(token, safeUser);
      }

      sendJson(response, 200, { user: safeUser });
      return;
    }

    if (pathname.startsWith('/api/admin/')) {
      if (!requireAdmin(request, response)) {
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/overview') {
        sendJson(response, 200, createAdminOverview());
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/users') {
        sendJson(response, 200, {
          users: users.map((user) => sanitizeUser(user)),
        });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/users') {
        if (!requireSuperAdmin(request, response)) {
          return;
        }
        const payload = await parseBody(request);
        const existingUser = users.find((u) => u.email === payload.email);
        if (existingUser) {
          sendJson(response, 409, { message: 'Email already registered.' });
          return;
        }
        const user = handleCollectionCreate(users, payload, {
          prefix: 'user',
          values: {
            role: 'user',
            status: 'active',
            phone: '',
          },
        });
        sendJson(response, 201, { user: sanitizeUser(user) });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/users/')) {
        if (!requireSuperAdmin(request, response)) {
          return;
        }
        const userId = pathname.split('/').pop();
        const payload = await parseBody(request);
        const user = handleCollectionPatch(users, userId, payload);
        if (!user) {
          sendJson(response, 404, { message: 'User not found.' });
          return;
        }

        sendJson(response, 200, { user: sanitizeUser(user) });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/users/')) {
        if (!requireSuperAdmin(request, response)) {
          return;
        }
        const userId = pathname.split('/').pop();
        if (!handleCollectionDelete(users, userId)) {
          sendJson(response, 404, { message: 'User not found.' });
          return;
        }

        sendJson(response, 200, { message: 'User removed successfully.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/services') {
        sendJson(response, 200, { services });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/services') {
        const payload = await parseBody(request);
        const service = handleCollectionCreate(services, payload, {
          prefix: 'service',
          values: { featured: false },
        });
        sendJson(response, 201, { service });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/services/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const service = handleCollectionPatch(services, id, payload);
        if (!service) {
          sendJson(response, 404, { message: 'Service not found.' });
          return;
        }

        sendJson(response, 200, { service });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/services/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(services, id)) {
          sendJson(response, 404, { message: 'Service not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Service deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/process') {
        sendJson(response, 200, { processItems });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/process') {
        const payload = await parseBody(request);
        const item = handleCollectionCreate(processItems, payload, {
          prefix: 'process',
          values: { step: String(processItems.length + 1).padStart(2, '0') },
        });
        sendJson(response, 201, { item });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/process/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const item = handleCollectionPatch(processItems, id, payload);
        if (!item) {
          sendJson(response, 404, { message: 'Process item not found.' });
          return;
        }

        sendJson(response, 200, { item });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/process/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(processItems, id)) {
          sendJson(response, 404, { message: 'Process item not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Process item deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/projects') {
        sendJson(response, 200, { projects });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/projects') {
        const payload = await parseBody(request);
        const project = handleCollectionCreate(projects, payload, {
          prefix: 'project',
          values: { featured: false, imageUrl: '/brand/a4.jpeg', videoUrl: '' },
        });
        sendJson(response, 201, { project });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/projects/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const project = handleCollectionPatch(projects, id, payload);
        if (!project) {
          sendJson(response, 404, { message: 'Project not found.' });
          return;
        }

        sendJson(response, 200, { project });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/projects/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(projects, id)) {
          sendJson(response, 404, { message: 'Project not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Project deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/products') {
        sendJson(response, 200, { products });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/products') {
        const payload = await parseBody(request);
        const product = handleCollectionCreate(products, payload, {
          prefix: 'product',
          values: {
            featured: false,
            price: 0,
            imageUrl: '/brand/a3.jpeg',
            swatch: 'linear-gradient(135deg, #b9b0a1, #f1ece1)',
          },
        });
        sendJson(response, 201, { product });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/products/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const product = handleCollectionPatch(products, id, payload);
        if (!product) {
          sendJson(response, 404, { message: 'Product not found.' });
          return;
        }

        product.price = Number(product.price || 0);
        sendJson(response, 200, { product });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/products/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(products, id)) {
          sendJson(response, 404, { message: 'Product not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Product deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/bookings') {
        sendJson(response, 200, { bookings });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/bookings/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const booking = handleCollectionPatch(bookings, id, payload);
        if (!booking) {
          sendJson(response, 404, { message: 'Booking not found.' });
          return;
        }

        sendJson(response, 200, { booking });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/bookings/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(bookings, id)) {
          sendJson(response, 404, { message: 'Booking not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Booking deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/inquiries') {
        sendJson(response, 200, { inquiries });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/inquiries/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const inquiry = handleCollectionPatch(inquiries, id, payload);
        if (!inquiry) {
          sendJson(response, 404, { message: 'Inquiry not found.' });
          return;
        }

        sendJson(response, 200, { inquiry });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/inquiries/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(inquiries, id)) {
          sendJson(response, 404, { message: 'Inquiry not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Inquiry deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/reviews') {
        sendJson(response, 200, { reviews });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/reviews/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const review = handleCollectionPatch(reviews, id, payload);
        if (!review) {
          sendJson(response, 404, { message: 'Review not found.' });
          return;
        }

        review.rating = Number(review.rating || 5);
        sendJson(response, 200, { review });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/reviews/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(reviews, id)) {
          sendJson(response, 404, { message: 'Review not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Review deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/content') {
        sendJson(response, 200, { content, blogs });
        return;
      }

      if (method === 'PATCH' && pathname === '/api/admin/content') {
        const payload = await parseBody(request);
        Object.assign(content.home, payload.home || {});
        Object.assign(content.about, payload.about || {});
        Object.assign(content.contact, payload.contact || {});
        queueDatabaseSave();
        sendJson(response, 200, { content });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/blogs') {
        sendJson(response, 200, { blogs });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/blogs') {
        const payload = await parseBody(request);
        const blog = handleCollectionCreate(blogs, payload, {
          prefix: 'blog',
          values: { published: false, excerpt: '' },
        });
        sendJson(response, 201, { blog });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/blogs/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const blog = handleCollectionPatch(blogs, id, payload);
        if (!blog) {
          sendJson(response, 404, { message: 'Blog not found.' });
          return;
        }

        sendJson(response, 200, { blog });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/blogs/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(blogs, id)) {
          sendJson(response, 404, { message: 'Blog not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Blog deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/notifications') {
        sendJson(response, 200, { notifications });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/notifications') {
        const payload = await parseBody(request);
        const notification = handleCollectionCreate(notifications, payload, {
          prefix: 'notification',
          values: { active: true, channel: 'email', body: '' },
        });
        sendJson(response, 201, { notification });
        return;
      }

      if (method === 'PATCH' && pathname.startsWith('/api/admin/notifications/')) {
        const id = pathname.split('/').pop();
        const payload = await parseBody(request);
        const notification = handleCollectionPatch(notifications, id, payload);
        if (!notification) {
          sendJson(response, 404, { message: 'Notification not found.' });
          return;
        }

        sendJson(response, 200, { notification });
        return;
      }

      if (method === 'DELETE' && pathname.startsWith('/api/admin/notifications/')) {
        const id = pathname.split('/').pop();
        if (!handleCollectionDelete(notifications, id)) {
          sendJson(response, 404, { message: 'Notification not found.' });
          return;
        }

        sendJson(response, 200, { message: 'Notification deleted.' });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/settings') {
        sendJson(response, 200, {
          seo: content.seo,
          appearance: content.appearance,
          security,
          backups,
        });
        return;
      }

      if (method === 'PATCH' && pathname === '/api/admin/settings') {
        const payload = await parseBody(request);
        Object.assign(content.seo, payload.seo || {});
        Object.assign(content.appearance, payload.appearance || {});
        Object.assign(security, payload.security || {});
        queueDatabaseSave();
        sendJson(response, 200, {
          seo: content.seo,
          appearance: content.appearance,
          security,
        });
        return;
      }

      if (method === 'POST' && pathname === '/api/admin/backups') {
        const backup = {
          id: `backup-${randomUUID().slice(0, 8)}`,
          label: 'Manual backup',
          createdAt: new Date().toISOString(),
          status: 'completed',
        };
        backups.unshift(backup);
        security.lastBackupAt = backup.createdAt;
        queueDatabaseSave();
        sendJson(response, 201, { backup });
        return;
      }

      if (method === 'GET' && pathname === '/api/admin/reports/export') {
        const format = searchParams.get('format') || 'pdf';
        sendJson(response, 200, {
          format,
          generatedAt: new Date().toISOString(),
          summary: {
            bookings: bookings.length,
            inquiries: inquiries.length,
            users: users.length,
            projects: projects.length,
            products: products.length,
          },
          analytics,
        });
        return;
      }
    }

    sendJson(response, 404, { message: 'Route not found.' });
  } catch (error) {
    sendJson(response, 500, {
      message: error.message || 'Unexpected server error.',
    });
  }
});

// 3. MongoDB connection check logic aur server configuration (Timeout handling ke sath)
async function startServer() {
  try {
    // 5 seconds ka timeout set kiya taaki connection hang na ho
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully!');
    await hydrateStore();
    console.log('Site data loaded from MongoDB.');

    server.listen(port, () => {
      console.log(`MTI Interiors API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); 
  }
}

startServer();
