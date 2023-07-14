import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';


export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (!existingUser) return res.status(404).json({ message: "User doesn't exist" })

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

    if (!isPasswordCorrect) return res.status(404).json({ message: "Invalid password" })

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.AUTH_SECRET, { expiresIn: '5d' })

    res.status(200).json({ result: existingUser, token })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const register = async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body

  try {
    const existingUser = await User.findOne({ email })

    if (existingUser) return res.status(400).json({ message: "User already exist" })

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      username,
      password: hashedPassword
    })

    const token = jwt.sign({ email: result.email, id: result._id }, process.env.AUTH_SECRET, { expiresIn: '5d' })

    res.status(200).json({ result: result, token })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const checkTokenExpired = async (req, res) => {
  try {

    res.status(200).json({ hasExpired: req.hasExpired })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getRecentUser = async (req, res) => {
  try {

    const id = req.params.id

    const user = await User.findById(id)

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
    console.log(error)
  }
}

