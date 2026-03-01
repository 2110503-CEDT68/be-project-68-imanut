const Restaurant = require('../models/restaurant');

//@desc    Get all restaurants (Requirement #3 - Restaurant list)
//@route   GET /api/v1/restaurants
exports.getRestaurants = async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');

  // Select & Sort Logic
  if (req.query.select) query = query.select(req.query.select.split(',').join(' '));
  query = req.query.sort ? query.sort(req.query.sort.split(',').join(' ')) : query.sort('-createdAt');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  try {
    const total = await Restaurant.countDocuments();
    const restaurants = await query.skip(skip).limit(limit);
    res.status(200).json({ success: true, count: restaurants.length, pagination: { page, limit, total }, data: restaurants });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc    Get single restaurant
//@route   GET /api/v1/restaurants/:id
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false });
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};