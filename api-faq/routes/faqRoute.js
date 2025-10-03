import express from 'express'
import { getAllFAQs,
		getFAQById,
		publishFAQ, 
		createFAQ, 
		updateFAQ, deleteFAQ, 
		incrementFAQViews 
		} from '../controllers/faqController.js'

const router = express.Router()

router.get('/', getAllFAQs)
router.get('/:id', getFAQById)
router.post('/', createFAQ)
router.put('/:id', updateFAQ)
router.put('/:id/views', incrementFAQViews)
router.delete('/:id', deleteFAQ)
router.put('/:id/publish', publishFAQ)

// Export the router to be used in server.js
export default router
