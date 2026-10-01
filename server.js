import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 10000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/', (_, res) => {
  res.json({
    ok: true,
    service: 'Anmol Fashion API',
    version: '2.0'
  });
});

/* =========================
   HELPERS
========================= */

function clean(v) {
  return typeof v === 'string' ? v.trim() : v;
}

function validateOrder(b) {
  const required = [
    'customer_name',
    'mobile',
    'address',
    'city',
    'pincode',
    'items'
  ];

  for (const key of required) {
    if (
      b[key] === undefined ||
      b[key] === null ||
      b[key] === ''
    ) {
      return `Missing ${key}`;
    }
  }

  if (!/^\d{10}$/.test(String(b.mobile))) {
    return 'Mobile must be 10 digits';
  }

  if (!/^\d{6}$/.test(String(b.pincode))) {
    return 'Pincode must be 6 digits';
  }

  if (!Array.isArray(b.items) || !b.items.length) {
    return 'Cart is empty';
  }

  return null;
}

function adminAuth(req, res) {
  if (
    process.env.ADMIN_KEY &&
    req.header('x-admin-key') !== process.env.ADMIN_KEY
  ) {
    res.status(401).json({
      error: 'Unauthorized'
    });

    return false;
  }

  return true;
}

/* =========================
   CREATE ORDER
========================= */

app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body || {};

    const validationError = validateOrder(b);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const order_id =
      'AF' + Date.now().toString().slice(-8);

    const items = b.items.map(x => ({
      product_id: clean(x.product_id) || null,
      name: clean(x.name) || 'Product',
      price: Number(x.price) || 0,
      size: clean(x.size) || null,
      color: clean(x.color) || null,
      qty: Math.max(1, Number(x.qty) || 1),
      image: clean(x.image) || null
    }));

    const total = items.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0
    );

    const row = {
      order_id,
      customer_name: clean(b.customer_name),
      mobile: clean(b.mobile),
      email: clean(b.email) || null,
      address: clean(b.address),
      city: clean(b.city),
      pincode: clean(b.pincode),
      payment_method:
        clean(b.payment_method) || 'COD',
      items,
      total,
      status: 'placed',
      tracking_number: null,
      courier_name: null,
      expected_delivery: null,
      shipped_at: null,
      delivered_at: null
    };

    const {
      data,
      error
    } = await supabase
      .from('orders')
      .insert(row)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase order error:', error);

      return res.status(500).json({
        error: error.message
      });
    }

    return res.status(201).json({
      ok: true,
      order_id,
      data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/* =========================
   CUSTOMER TRACK ORDER
   Order ID + Mobile
========================= */

app.post('/api/track-order', async (req, res) => {
  try {
    const orderId = clean(req.body?.order_id);
    const mobile = clean(req.body?.mobile);

    if (!orderId || !mobile) {
      return res.status(400).json({
        error: 'Order ID and mobile number are required'
      });
    }

    if (!/^\d{10}$/.test(String(mobile))) {
      return res.status(400).json({
        error: 'Mobile must be 10 digits'
      });
    }

    const {
      data,
      error
    } = await supabase
      .from('orders')
      .select(`
        order_id,
        customer_name,
        mobile,
        city,
        payment_method,
        items,
        total,
        status,
        tracking_number,
        courier_name,
        expected_delivery,
        shipped_at,
        delivered_at,
        created_at
      `)
      .eq('order_id', orderId)
      .eq('mobile', mobile)
      .maybeSingle();

    if (error) {
      console.error(error);

      return res.status(500).json({
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        error: 'Order not found. Please check Order ID and mobile number.'
      });
    }

    return res.json({
      ok: true,
      order: data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/* =========================
   CUSTOMER ORDER BY ID
========================= */

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const {
      data,
      error
    } = await supabase
      .from('orders')
      .select(`
        order_id,
        customer_name,
        status,
        total,
        payment_method,
        tracking_number,
        courier_name,
        expected_delivery,
        shipped_at,
        delivered_at,
        created_at,
        items
      `)
      .eq('order_id', req.params.orderId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    return res.json({
      ok: true,
      order: data
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/* =========================
   ADMIN - ALL ORDERS
========================= */

app.get('/api/admin/orders', async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const limit = Math.min(
      Number(req.query.limit) || 100,
      500
    );

    const {
      data,
      error
    } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', {
        ascending: false
      })
      .limit(limit);

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    return res.json({
      ok: true,
      orders: data || []
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/* =========================
   ADMIN - DASHBOARD STATS
========================= */

app.get('/api/admin/dashboard', async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const {
      data: orders,
      error
    } = await supabase
      .from('orders')
      .select(
        'order_id,total,status,created_at'
      );

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    const list = orders || [];

    const stats = {
      totalOrders: list.length,

      totalSales: list.reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      ),

      placed: list.filter(
        x => x.status === 'placed'
      ).length,

      confirmed: list.filter(
        x => x.status === 'confirmed'
      ).length,

      packed: list.filter(
        x => x.status === 'packed'
      ).length,

      shipped: list.filter(
        x => x.status === 'shipped'
      ).length,

      out_for_delivery: list.filter(
        x => x.status === 'out_for_delivery'
      ).length,

      delivered: list.filter(
        x => x.status === 'delivered'
      ).length,

      cancelled: list.filter(
        x => x.status === 'cancelled'
      ).length
    };

    return res.json({
      ok: true,
      stats
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/* =========================
   ADMIN - UPDATE ORDER
========================= */

app.patch(
  '/api/admin/orders/:orderId',
  async (req, res) => {

    if (!adminAuth(req, res)) return;

    try {
      const allowedStatuses = [
        'placed',
        'confirmed',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ];

      const body = req.body || {};

      const update = {};

      if (body.status !== undefined) {
        const status =
          String(body.status).toLowerCase();

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            error: 'Invalid status'
          });
        }

        update.status = status;

        if (status === 'shipped') {
          update.shipped_at =
            new Date().toISOString();
        }

        if (status === 'delivered') {
          update.delivered_at =
            new Date().toISOString();
        }
      }

      if (body.tracking_number !== undefined) {
        update.tracking_number =
          clean(body.tracking_number) || null;
      }

      if (body.courier_name !== undefined) {
        update.courier_name =
          clean(body.courier_name) || null;
      }

      if (body.expected_delivery !== undefined) {
        update.expected_delivery =
          body.expected_delivery || null;
      }

      if (!Object.keys(update).length) {
        return res.status(400).json({
          error: 'Nothing to update'
        });
      }

      const {
        data,
        error
      } = await supabase
        .from('orders')
        .update(update)
        .eq(
          'order_id',
          req.params.orderId
        )
        .select('*')
        .single();

      if (error) {
        console.error(error);

        return res.status(500).json({
          error: error.message
        });
      }

      return res.json({
        ok: true,
        order: data
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

/* =========================
   OLD STATUS API
   Kept for compatibility
========================= */

app.patch(
  '/api/admin/orders/:orderId/status',
  async (req, res) => {

    if (!adminAuth(req, res)) return;

    try {
      const allowed = [
        'placed',
        'confirmed',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ];

      const status =
        String(
          req.body?.status || ''
        ).toLowerCase();

      if (!allowed.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status'
        });
      }

      const update = {
        status
      };

      if (status === 'shipped') {
        update.shipped_at =
          new Date().toISOString();
      }

      if (status === 'delivered') {
        update.delivered_at =
          new Date().toISOString();
      }

      const {
        data,
        error
      } = await supabase
        .from('orders')
        .update(update)
        .eq(
          'order_id',
          req.params.orderId
        )
        .select('*')
        .single();

      if (error) {
        return res.status(500).json({
          error: error.message
        });
      }

      return res.json({
        ok: true,
        order: data
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

/* =========================
   SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `Anmol Fashion API running on ${PORT}`
  );
});
