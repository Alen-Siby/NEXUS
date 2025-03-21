const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function userSignInController(req, res) {
    try {
        // Trim email and password to remove leading/trailing whitespace
        const email = req.body.email?.trim();
        const password = req.body.password?.trim();

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide both email and password.",
                error: true,
                success: false
            });
        }

        // Find user by email and include password in the query
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password,10);
        // Verify password


      


// const password1 = "123";
// const saltRounds = 10;

// bcrypt.hash(password1, saltRounds, (err, hash) => {
//     if (err) throw err;

//     // Log the manually created hash
//     console.log("Generated hash for '123':", hash);

//     // Compare the password with the generated hash
//     bcrypt.compare(password1, hash, (err, result) => {
//         if (err) throw err;
//         console.log("Does '123' match the generated hash?:", result);
//     });
// });

        // password1="123"
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log(password)
        console.log(user.password)
        console.log(isPasswordMatch)
        console.log(`Password check result for user ${email} -> ${isPasswordMatch}`);

        if (isPasswordMatch) {
            // Create token with role
            const tokenData = {
                _id: user._id,
                email: user.email,
                role: user.role // Include role in token data for redirection later
            };
            const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });

            // Set cookie options with more permissive settings
            const tokenOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Only true in production
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
                path: '/'
            };
            
            // Add debug logging
            console.log('Token being set:', token);
            console.log('Cookie options:', tokenOptions);
            
            // Set the cookie and send response
            res.cookie("token", token, tokenOptions);
            
            // Add debug header to check if cookies are being set
            res.setHeader('X-Cookie-Set', 'true');
            
            return res.status(200).json({
                message: "Login successful",
                data: { 
                    token,
                    user: {
                        email: user.email,
                        role: user.role
                    }
                },
                success: true,
                error: false
            });
        } else {
            console.log(`Invalid password attempt for user: ${email}`);
            return res.status(401).json({
                message: "Invalid email or password",
                error: true,
                success: false
            });
        }
        
    } catch (err) {
        console.error("Error during login:", err.message || err);
        res.status(500).json({
            message: "An error occurred during login",
            error: true,
            success: false
        });
    }
}

module.exports = userSignInController;