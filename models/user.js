import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  tier: { type: String, default: 'Free Plan' },
  id: { type: String },
});

const User = mongoose.model('user', userSchema);

export default User;