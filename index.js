
const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const port = 3000;

// connecting to cloud redis 
const redisClient = redis.createClient({
  url: "*****************"
})

redisClient.on("error", (error) => {
  console.error(error);
});

redisClient.on("connect", () => {
  console.log("Redis instance successfully connected.");
})

redisClient.connect()

app.get('/dictionary/:word', async (req, res) => {
  try {
    const word = req.params.word;
    let response = {};

    // Check if the details of requested word present in cache
    wordInfo = await redisClient.get(word);
    console.log(word);
    console.log(wordInfo);
    if (wordInfo) { // if the details present in cache, use as response 
      response = {
        err: false,
        msg: "This response is from cache",
        data: JSON.parse(wordInfo)
      }
    } else { // if the details are not present in cache, update the redis and send the response. 
      wordInfo = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      wordInfo = wordInfo.data;
      await redisClient.set(word, JSON.stringify(wordInfo))
      response = {
        err: false,
        msg: "This respnose is not from cache",
        data: wordInfo
      }
    }

    return res.status(200).send(response);

  } catch (error) {
    console.log(error)
    return res.status(200).send({
      error: true,
      data: "Internal server error"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}, Waiting for requests!`);
});


module.exports = app;