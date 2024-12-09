const express = require('express');
const cors = require('cors');
const { hamroPatro, getHoroscope, getGoldPrices, getExchangeRates } = require('hamro-patro-scraper');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Get Nepali date and time
app.get('/datetime', async (req, res) => {
  try {
    const dateTime = await hamroPatro();
    res.json(dateTime);
  } catch (error) {
    console.error('Error fetching date and time:', error);
    res.status(500).json({ error: 'Failed to fetch date and time' });
  }
});

// Get all rashifal
app.get('/rashifal', async (req, res) => {
  try {
    const horoscope = await getHoroscope();
    const formattedHoroscope = Object.entries(horoscope).map(([sign, prediction]) => ({
      sunsign: sign,
      prediction: prediction
    }));
    res.json(formattedHoroscope);
  } catch (error) {
    console.error('Error fetching horoscope:', error);
    res.status(500).json({ error: 'Failed to fetch horoscope' });
  }
});

// Get specific rashifal
app.get('/rashifal/:span/:sign', async (req, res) => {
  try {
    const { span, sign } = req.params;
    const horoscope = await getHoroscope();
    
    if (!horoscope[sign]) {
      return res.status(404).json({ error: 'Rashifal not found for given sign' });
    }
    
    res.json({
      sunsign: sign,
      prediction: horoscope[sign],
      span: span
    });
  } catch (error) {
    console.error('Error fetching specific horoscope:', error);
    res.status(500).json({ error: 'Failed to fetch specific horoscope' });
  }
});

// Get gold prices
app.get('/gold', async (req, res) => {
  try {
    const prices = await getGoldPrices();
    // Format the gold prices data
    const formattedPrices = Object.entries(prices)
      .filter(([key]) => key !== 'date' && key !== 'lastUpdated')
      .map(([type, data]) => ({
        type,
        price: typeof data === 'object' ? data.price : data
      }));

    res.json({
      data: formattedPrices,
      lastUpdated: prices.date || prices.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    res.status(500).json({ error: 'Failed to fetch gold prices' });
  }
});

// Get exchange rates
app.get('/forex', async (req, res) => {
  try {
    const rates = await getExchangeRates();
    // Format the rates data
    const formattedRates = Object.entries(rates)
      .filter(([key]) => key !== 'date' && key !== 'lastUpdated')
      .map(([currency, data]) => ({
        currency,
        ...data
      }));

    res.json({
      data: formattedRates,
      lastUpdated: rates.date || rates.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
