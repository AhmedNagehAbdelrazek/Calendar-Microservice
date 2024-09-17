const { syncEvents, addEvent, listEvents  } = require('../Controller/calenderController')
const express = require('express')

const router = express.Router()

router.post('/add', addEvent);


module.exports = router;

