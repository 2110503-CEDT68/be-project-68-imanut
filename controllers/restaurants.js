const Restaurant = require('../models/Restaurant');

//@desc    Get all restaurants
//@route   GET /api/v1/restaurants
exports.getRestaurants = async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');

  
  if (req.query.select) query = query.select(req.query.select.split(',').join(' '));
  query = req.query.sort ? query.sort(req.query.sort.split(',').join(' ')) : query.sort('-createdAt');

  
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


//@desc    Create restaurant
//@route   POST /api/v1/restaurants
//@access  Private
exports.createRestaurant = async (req, res, next) => {
  try {
  
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to create restaurants' });
    }

    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//@desc    Update restaurant
//@route   PUT /api/v1/restaurants/:id
//@access  Private
exports.updateRestaurant = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update restaurants' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc    Delete restaurant
//@route   DELETE /api/v1/restaurants/:id
//@access  Private
exports.deleteRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        await restaurant.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};