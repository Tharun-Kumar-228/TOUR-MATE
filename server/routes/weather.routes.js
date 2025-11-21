import express from 'express';
import {
  getTodayWeather,
  getPast7DaysWeather,
  getForecastWeather,
} from '../controllers/weather.controller.js';

const router = express.Router();

router.get('/today', getTodayWeather);
router.get('/past7', getPast7DaysWeather);
router.get('/forecast', getForecastWeather);

export default router;
