import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


/* ================= HOME ================= */

app.get("/", (req, res) => {

  res.json({
    ok: true,
    service: "Anmol Fashion API"
  });

});


/* ================= PLACE ORDER ================= */

app.post("/api/orders", async (req, res) => {

  try {

    console.log("ORDER REQUEST:", req.body);

    const {
      orderId,
      customerName,
      mobile,
      email,
      address,
      city,
      pincode,
      paymentMethod,
      items,
      total
    } = req.body;


    /* ================= VALIDATION ================= */

    if (
      !customerName ||
      !mobile ||
      !address ||
      !city ||
      !pincode ||
      !Array.isArray(items) ||
      !items.length
    ) {

      return res.status(400).json({
        ok: false,
        error: "Required order details missing"
      });

    }


    if (!/^[0-9]{10}$/.test(String(mobile))) {

      return res.status(400).json({
        ok: false,
        error: "Invalid mobile number"
      });

    }


    if (!/^[0-9]{6}$/.test(String(pincode))) {

      return res.status(400).json({
        ok: false,
        error: "Invalid pincode"
      });

    }


    /* ================= ORDER ID ================= */

    const finalOrderId =
      orderId ||
      "AF-" + Date.now();


    /* ================= DATABASE INSERT ================= */

    const orderData = {

      order_id: finalOrderId,

      customer_name: customerName,

      mobile: mobile,

      email: email || null,

      address: address,

      city: city,

      pincode: pincode,

      payment_method: paymentMethod || "COD",

      items: items,

      total: Number(total || 0),

      status: "placed"

    };


    console.log("ORDER DATA:", orderData);


    const { data, error } =
      await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();


    /* ================= SUPABASE ERROR ================= */

    if (error) {

      console.error(
        "SUPABASE ORDER ERROR:",
        error
      );

      return res.status(500).json({

        ok: false,

        error: error.message,

        details: error.details || null,

        hint: error.hint || null

      });

    }


    /* ================= SUCCESS ================= */

    res.status(201).json({

      ok: true,

      message: "Order placed successfully",

      order_id: finalOrderId,

      order: data

    });


  } catch (error) {

    console.error(
      "ORDER API ERROR:",
      error
    );

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

});


/* ================= ADMIN ORDERS ================= */

app.get("/api/orders", async (req, res) => {

  try {

    if (
      req.headers["x-admin-key"] !==
      process.env.ADMIN_KEY
    ) {

      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      });

    }


    const {
      data,
      error
    } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      return res.status(500).json({
        ok: false,
        error: error.message
      });

    }


    res.json(data);


  } catch (error) {

    res.status(500).json({
      ok: false,
      error: error.message
    });

  }

});


/* ================= SERVER ================= */

const port =
  process.env.PORT || 10000;


app.listen(
  port,
  "0.0.0.0",
  () => {

    console.log(
      `Anmol Fashion API running on ${port}`
    );

  }
);
