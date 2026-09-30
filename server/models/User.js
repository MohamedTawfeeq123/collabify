const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Represents a registered Collabify user.
 * Stores personal details, credentials, bio, and preferences.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be between 2 and 50 characters'],
      maxlength: [50, 'Name must be between 2 and 50 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be 3–20 characters'],
      maxlength: [20, 'Username must be 3–20 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must contain at least 8 characters']
    },
    // Company-issued Employee ID (e.g. EMP-1024). Unique, but optional so
    // accounts created before this field existed keep working.
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
      minlength: [3, 'Employee ID must be 3-20 characters'],
      maxlength: [20, 'Employee ID must be 3-20 characters']
    },
    department: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Department cannot exceed 50 characters']
    },
    designation: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Designation cannot exceed 50 characters']
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot exceed 200 characters']
    },
    profilePicture: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
