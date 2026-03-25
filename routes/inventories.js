var express = require("express");
var router = express.Router();
const Inventory = require("../schemas/inventories");

// 1. GET ALL (Join với product)
router.get("/", async (req, res) => {
  try {
    const inventories = await Inventory.find().populate("product");
    res.status(200).json(inventories);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// 2. GET BY ID (Join với product)
router.get("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate("product");
    if (!inventory) return res.status(404).json({ message: "Không tìm thấy kho" });
    res.status(200).json(inventory);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// 3. POST Add_stock (Tăng stock)
router.post("/add_stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;
    const inv = await Inventory.findOneAndUpdate(
      { product: product },
      { $inc: { stock: quantity } }, // $inc dùng để cộng dồn
      { new: true }
    );
    res.status(200).json(inv);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

// 4. POST Remove_stock (Giảm stock)
router.post("/remove_stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;
    const inv = await Inventory.findOneAndUpdate(
      { product: product, stock: { $gte: quantity } }, // Phải đảm bảo stock hiện tại >= số lượng muốn trừ
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!inv) return res.status(400).json({ message: "Kho không đủ hàng hoặc sai ID" });
    res.status(200).json(inv);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

// 5. POST Reservation (Giảm stock, tăng reserved)
router.post("/reservation", async (req, res) => {
  try {
    const { product, quantity } = req.body;
    const inv = await Inventory.findOneAndUpdate(
      { product: product, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, reserved: quantity } },
      { new: true }
    );
    if (!inv) return res.status(400).json({ message: "Kho không đủ hàng để giữ chỗ" });
    res.status(200).json(inv);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

// 6. POST Sold (Giảm reserved, tăng soldCount)
router.post("/sold", async (req, res) => {
  try {
    const { product, quantity } = req.body;
    const inv = await Inventory.findOneAndUpdate(
      { product: product, reserved: { $gte: quantity } }, // Đảm bảo hàng giữ chỗ >= số lượng bán
      { $inc: { reserved: -quantity, soldCount: quantity } },
      { new: true }
    );
    if (!inv) return res.status(400).json({ message: "Số lượng giữ chỗ không đủ để xuất bán" });
    res.status(200).json(inv);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

module.exports = router;