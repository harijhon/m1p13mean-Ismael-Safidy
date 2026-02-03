import Customer from '../models/Customer.js';

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single customer
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer == null) {
      return res.status(404).json({ message: 'Cannot find customer' });
    }
    res.json(customer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  });

  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer == null) {
      return res.status(404).json({ message: 'Cannot find customer' });
    }

    if (req.body.name != null) {
      customer.name = req.body.name;
    }
    if (req.body.email != null) {
      customer.email = req.body.email;
    }
    if (req.body.phone != null) {
      customer.phone = req.body.phone;
    }
    if (req.body.address != null) {
      customer.address = req.body.address;
    }

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer == null) {
      return res.status(404).json({ message: 'Cannot find customer' });
    }

    await customer.deleteOne();
    res.json({ message: 'Deleted customer' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
