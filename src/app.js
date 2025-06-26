const request = require('postman-request');
const express = require('express');
const path = require('path');
const app = express();

const news = (userAgent, topic, callback) => {
  const APIkey = "1b0506e2d2fc47469be9276b0d3ccae4";
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&pageSize=10&sortBy=publishedAt&language=en&apiKey=${APIkey}`;
  request({url, json: true, headers: {'User-Agent': userAgent}}, (error, response, body) => {
    if (error) {
      callback("Unable to connect to server", undefined);
    } else if (!body) {
      callback("No response body received", undefined);
    } else if (body.status === 'error') {
      callback(body.message, undefined);
    } else {
      callback(undefined, body);
    }
  });
};

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

app.get("/news", (req, res) => {
  const userAgent = req.get('user-agent');
  const topic = req.query.q;

  if (!topic) {
    return res.send({ error: 'You must provide a topic.' });
  }

  console.log(`Buscando: ${topic}`);

  news(userAgent, topic, (error, data) => {
    if (error) {
      console.log('Erro ao buscar notícias:', error);
      return res.send({ error });
    }
    res.send({
      articles: data.articles || [],
      topic,
      totalResults: (data && typeof data.totalResults === 'number') ? data.totalResults : 0
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

