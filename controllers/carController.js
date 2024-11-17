const Car = require('../models/carModel');

// Get all cars
const getCars = async (req, res) => {
    try {
        const cars = await Car.find({ user: req.user.id });
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new car
const createCar = async (req, res) => {
    const { title, description } = req.body;

    try {
        const car = new Car({
            title,
            description,
            user: req.user.id,
        });

        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific car
const getCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a car
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await car.remove();
        res.json({ message: 'Car removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCars, createCar, getCar, deleteCar };
