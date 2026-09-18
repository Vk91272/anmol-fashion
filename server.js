import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();

const app=express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

app.get("/",(req,res)=>res.json({ok:true,service:"Anmol Fashion API"}));

app.post("/api/orders",async(req,res)=>{
  try{
    const {customer_name,mobile,address,city,pincode,payment_method,items,total}=req.body;
    if(!customer_name||!mobile||!address||!city||!pincode||!Array.isArray(items)||!items.length)
      return res.status(400).json({error:"Required order details missing"});
    const order_id="AF"+Date.now().toString().slice(-8);
    const {error}=await supabase.from("orders").insert({
      order_id,customer_name,mobile,address,city,pincode,payment_method,
      items,total,status:"placed"
    });
    if(error) return res.status(500).json({error:error.message});
    res.json({ok:true,order_id});
  }catch(e){res.status(500).json({error:e.message})}
});

app.get("/api/orders",async(req,res)=>{
  if(req.headers["x-admin-key"]!==process.env.ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  const {data,error}=await supabase.from("orders").select("*").order("created_at",{ascending:false});
  if(error)return res.status(500).json({error:error.message});
  res.json(data);
});

const port=process.env.PORT||10000;
app.listen(port,"0.0.0.0",()=>console.log(`Anmol Fashion API running on ${port}`));