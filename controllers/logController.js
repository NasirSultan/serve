const Log = require('../models/Log');

exports.getProductLog = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user._id })
      .select('-__v')
      .populate('user', 'username')
      .sort({ timestamp: -1 });

    // Calculate the expiration date based on the action and the timestamp
    const logsWithExpiration = logs.map(log => {
      let expirationDate;
      
      // Action-based expiration calculation
      if (log.action === 'add') {
        expirationDate = new Date(log.timestamp.getTime() + 60 * 60 * 24 * 7 * 1000); // 7 days for 'add'
      } else if (log.action === 'delete') {
        expirationDate = new Date(log.timestamp.getTime() + 60 * 60 * 24 * 1 * 1000); // 3 days for 'delete'
      }

      // Include expiration date in the log object
      return {
        ...log.toObject(),
        expirationDate
      };
    });

    res.json(logsWithExpiration);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching product logs' });
  }
};


exports.getAddDeleteLog = async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user._id })
      .select('-__v')
      .populate('user', 'username')
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching add/delete logs' });
  }
};



exports.deleteAllLogs = async (req, res) => {
  try {
    // Delete all logs associated with the authenticated user
    const result = await Log.deleteMany({ user: req.user._id });

    if (result.deletedCount > 0) {
      res.json({ message: 'All logs have been successfully deleted.' });
    } else {
      res.status(404).json({ message: 'No logs found for the user.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting logs' });
  }
};




exports.getProductLogByBody = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required in request body' });
    }

    const logs = await Log.find({ user: userId })
      .select('-__v')
      .populate('user', 'username')
      .sort({ timestamp: -1 });

    // Calculate expiration dates based on action
    const logsWithExpiration = logs.map(log => {
      let expirationDate;

      if (log.action === 'add') {
        expirationDate = new Date(log.timestamp.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      } else if (log.action === 'delete') {
        expirationDate = new Date(log.timestamp.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
      }

      return {
        ...log.toObject(),
        expirationDate
      };
    });

    res.json(logsWithExpiration);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching product logs' });
  }
};











exports.getLast7DaysStats = async (req, res) => {
  try {
    // Get all logs from the Log collection, populating user and product details
    const logs = await Log.find()
     
      .populate('product', 'name price'); // Populate product info (adjust fields as needed)

    // Simply return the logs without aggregation or summary calculation
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



