const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://indeks.kompas.com';
const arrayLink = []
const fs = require("fs");

const getNews = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const kompasURL = [];
    let news_homepage = $('.latest--indeks .article__list__title .article__link', data)

    for (let i = 0; i < news_homepage.length; i++) {
      try {
        kompasURL.push(news_homepage[i].attribs.href);
      } catch (error) {
        // error
      }
    }

    await Promise.all(kompasURL.map(async (url) => {
      let json = await kompasParse(url);
      return json
    }))
    
    let all_news = await Promise.all(arrayLink.map(async (url) => {
      let json = await generateData(url);
      return json
    }))

    // console.log(all_news.length);
    await generateJSON(all_news)

  } catch (error) {
    console.error(error);
  }
}

const generateJSON = async (all_news) => {
  let json = JSON.stringify(all_news);

  fs.writeFile("news.json", json, (error) => {
    if (error) {
        console.log("Error");
    } else {
        console.log("Success");
    }
  })
}

const generateData = async (url) => {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    let json = {
      title: $('.read__title', data).text(),
      published_date: $('.read__time', data).text(),
      author: $('.read__credit__item > a', data).text(),
      url: url
    }
    return json
  } catch (error) {
    console.error(error)
  }
}

const kompasParse = async (url) => {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data)
  let depth_link = $('.inner-link-baca-juga', data)
  return await collectLink(url, depth_link) 
}

const collectLink = async (url, depth_link) => {
  arrayLink.push(url)
  if (depth_link.length >= 1) {
    for (let i = 0; i < depth_link.length; i++) {
      // Configurable Level of Depthness (Please change number 2 to number you want)
      if (i < 2) {
        arrayLink.push(depth_link[i].attribs.href)
      }
    }
  }
}

getNews(url)