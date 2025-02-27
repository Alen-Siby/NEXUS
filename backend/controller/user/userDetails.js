const userModel = require("../../models/userModel");
const { validationResult } = require("express-validator");

// Controller to fetch user details
async function userDetailsController(req, res) {
    try {
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        res.status(200).json({
            data: user,
            error: false,
            success: true,
            message: "User details fetched successfully",
        });
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({
            message: "An error occurred while fetching user details",
            error: true,
            success: false,
        });
    }
}

// Controller to update user details
async function updateUserDetailsController(req, res) {
    const {
        name,
        email,
        profilePic,
        phoneNumber,
        additionalPhoneNumber,
        houseFlat,
        street,
        postOffice,
        district,
        state,
        zipCode,
        role,
        licenseNumber,
        latitude,
        longitude,
        locationName
    } = req.body;

    console.log("Incoming request data:", req.body);

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if user exists
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", error: true, success: false });
        }

        // Update user details conditionally
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (additionalPhoneNumber) user.additionalPhoneNumber = additionalPhoneNumber;
        if (role) user.role = role;
        if (licenseNumber) user.licenseNumber = licenseNumber;
        if (profilePic) user.profilePic = profilePic;

        // Update location fields if user is a vendor
        if (user.role === 'Vendor') {
            // Update location coordinates and name if provided
            if (latitude !== undefined && longitude !== undefined) {
                user.latitude = latitude;
                user.longitude = longitude;
            }
            if (locationName) {
                user.locationName = locationName;
            }
        }

        // Update address fields directly
        if (houseFlat) user.houseFlat = houseFlat;
        if (street) user.street = street;
        if (postOffice) user.postOffice = postOffice;
        if (district) user.district = district;
        if (state) user.state = state;
        if (zipCode) user.zipCode = zipCode;

        // Concatenate sub-address fields into a single 'address' field
        const fullAddress = [
            houseFlat?.trim() || "",
            street?.trim() || "",
            postOffice?.trim() || "",
            district?.trim() || "",
            state?.trim() || "",
            zipCode?.trim() || ""
        ]
        .filter(Boolean) // Remove empty fields
        .join(", "); // Join with a comma and space

        // Store the concatenated address in the 'address' field (array)
        if (fullAddress) {
            user.address = [fullAddress];  // Storing as an array
        }

        // Save the updated user
        const updatedUser = await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            data: updatedUser,
            error: false,
            success: true,
        });
    } catch (err) {
        console.error("Error updating user details:", err);
        return res.status(500).json({
            message: "An error occurred while updating user details",
            error: true,
            success: false,
            details: err.message // Provide error details for debugging
        });
    }
}

module.exports = {
    userDetailsController,
    updateUserDetailsController,
};
