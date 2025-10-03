import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import faqRoutes from './routes/faqRoute.js'

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use('/api/faqs', faqRoutes)

// Start the server on port 5000
app.listen(5000, () => console.log('Server running on port 5000'))
