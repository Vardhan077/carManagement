
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password);
  
    // Find the user and verify the password
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Generate the JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    res.json({ token });  // Send the token to the frontend
  };
  