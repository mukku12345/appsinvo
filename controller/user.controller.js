const db = require("../model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');
const dayjs = require('dayjs');
const User = db.tables.User;

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, address, longitude, latitude } = req.query;

        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        var regName = /^[A-Za-z]+$/;

        if (!email.match(validRegex)) {
            return res.status(400).json({
                message: "Invalid Email Id"
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).send({
                message: 'This user is already in use!',
            });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = new User({ name, email, password: hashedPassword, address, longitude, latitude });

            await newUser.save();

            // const generateRandomKey = () => {
            //     return crypto.randomBytes(32).toString('hex'); // Generate a 256-bit (32-byte) random key
            // };
         
         
            const token = jwt.sign({ userId: newUser._id },"SECRET_JWT_CODE"); 

           
            res.status(200).json({
                status_code: "200",
                message: 'User Registered Successfully',
                data: {
                    name: newUser.name,
                    email: newUser.email,
                    address: newUser.address,
                    latitude: newUser.latitude,
                    longitude: newUser.longitude,
                    status: newUser.status,
                    token: token,
                 
                },
                
            });
           
        }
    } catch (error) {
        console.log('Error registering user:', error);
        res.status(500).json({
            message: error.message || "Some error occurred while creating the user."
        });
    }
};


exports.changeStatus = async (req,res) =>{

    const userId = req.userId;

    await User.updateMany({}, { $set: { status: { $cond: { if: { $eq: ['$status', 'active'] }, then: 'inactive', else: 'active' } } } });

    const updatedUsers = await User.find();

    res.status(200).json({ message: 'User statuses toggled successfully', users: updatedUsers });
}

 exports.calculateDistance =  ((req, res) => {
    const { destLatitude, destLongitude } = req.query;

    if (!destLatitude || !destLongitude) {
        return res.status(400).json({ message: 'Invalid destination coordinates' });
    }

    // Assuming source coordinates are (0, 0) for illustration purposes
    const sourceCoordinates = { latitude: 0, longitude: 0 };
    const destinationCoordinates = { latitude: parseFloat(destLatitude), longitude: parseFloat(destLongitude) };

    const distanceInMeters = geolib.getDistance(sourceCoordinates, destinationCoordinates);
    const distanceInKilometers =Math.floor(distanceInMeters / 1000);

    res.status(200).json({status_code:200 ,message:"successfull" ,distance:`${distanceInKilometers}Km` });
});


// Make sure to provide the correct path to your User model
// Make sure to provide the correct path to your User model

exports.getAllUserWeekDayWise = async (req, res) => {
    try {
        const selectedDays = req.body.selectedDays; // Assuming you're sending the selected days in the request body

        if (!selectedDays || !Array.isArray(selectedDays)) {
            return res.status(400).json({ status_code: '400', message: 'Please provide an array of selected days.' });
        }

        // Fetch all users with the registered date
        const users = await User.find({}, { name: 1, email: 1, register_at: 1 });

        // Convert the registered date to day of the week and filter users based on selected days
        const usersFilteredByDays = users
            .map(user => {
                const dayOfWeek = dayjs(user.register_at).day(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                return {
                    ...user.toObject(), // Convert Mongoose document to plain JavaScript object
                    dayOfWeek,
                };
            })
            .filter(user => selectedDays.includes(user.dayOfWeek));

        // Structure the response based on the selected days
        const response = {
            status_code: '200',
            message: 'Success',
            data: {},
        };

        // Populate response data for each selected day
        selectedDays.forEach(day => {
            const dayName = dayjs().day(day).format('dddd').toLowerCase(); // Get the day name (e.g., Monday)
            response.data[dayName] = usersFilteredByDays
                .filter(user => user.dayOfWeek === day)
                .map(user => ({
                    name: user.name,
                    email: user.email,
                }));
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ status_code: '500', message: error.message });
    }
};

