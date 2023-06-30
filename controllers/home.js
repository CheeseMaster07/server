export const getHome = async (req, res) => {
  try {
    res.status(200).json('Home')
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}