import axios from 'axios'

// This creates a pre-configured axios instance.
// Every API call in the app uses this instead of raw fetch.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10 seconds before giving up
})

export default api