const Reservation = require('../models/reservation');

//@desc   Get all reservations (Requirement #7)
//@route  GET /api/v1/reservations
exports.getReservations = async (req, res, next) => {
  let query;

  // Requirement #7: Admin ดูได้ทุกคน / User ดูได้เฉพาะของตนเอง
  if (req.user.role === 'admin') {
    // Admin: หาการจองทั้งหมดในระบบ
    query = Reservation.find().populate({
      path: 'restaurant',
      select: 'name address tel'
    });
  } else {
    // User: หาเฉพาะที่ user field ตรงกับ ID ของผู้ล็อกอิน
    query = Reservation.find({ user: req.user.id }).populate({
      path: 'restaurant',
      select: 'name address tel'
    });
  }

  try {
    const reservations = await query;
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cannot find Reservation" });
  }
};

//@desc   Update reservation (Requirement #8)
//@route  PUT /api/v1/reservations/:id
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'No reservation found' });

    // Requirement #8: เช็คว่าเป็นเจ้าของ หรือว่าเป็น Admin
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: `User ${req.user.id} is not authorized to update this reservation` 
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cannot update Reservation" });
  }
};

//@desc   Delete reservation (Requirement #9)
//@route  DELETE /api/v1/reservations/:id
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'No reservation found' });

    // Requirement #9: เช็คว่าเป็นเจ้าของ หรือว่าเป็น Admin
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: `User ${req.user.id} is not authorized to delete this reservation` 
      });
    }

    await reservation.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cannot delete Reservation" });
  }
};

//@desc   Add reservation
//@route  POST /api/v1/restaurants/:restaurantId/reservations/
//@access Private
exports.addReservation = async (req, res, next) => {
  try {
    // 1. นำ restaurantId จาก URL parameter มาใส่ใน body
    req.body.restaurant = req.params.restaurantId;
    
    // 2. ผูก ID ของผู้ใช้งานที่ล็อกอินอยู่เข้ากับการจอง
    req.body.user = req.user.id;

    // 3. ตรวจสอบว่าร้านอาหารที่ต้องการจองมีตัวตนจริงหรือไม่
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: `No restaurant with the id of ${req.params.restaurantId}` 
      });
    }

    // 4. BUSINESS LOGIC: ตรวจสอบโควต้าการจอง (Requirement #3)
    // ค้นหาการจองที่มีอยู่แล้วของ user คนนี้
    const existedReservations = await Reservation.find({ user: req.user.id });

    // ถ้าจองครบ 3 ที่แล้ว และไม่ใช่ Admin จะไม่อนุญาตให้จองเพิ่ม
    if (existedReservations.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({ 
        success: false, 
        message: `The user with ID ${req.user.id} has already made 3 reservations` 
      });
    }

    // 5. บันทึกข้อมูลการจองลง Database
    const reservation = await Reservation.create(req.body);

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ 
      success: false, 
      message: 'Cannot create reservation' 
    });
  }
};