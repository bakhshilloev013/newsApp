"use strict";

function myHttpRequest({ method, url } = {}, cb) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        cb(null, response);
      } else {
        cb(`Error, status code: ${xhr.status}`);
        return;
      }
    };

    xhr.onerror = () => {
      console.log("error", xhr.status, xhr.statusText);
    };

    xhr.send();
  } catch (error) {
    cb(error);
  }
}

function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          } else {
            cb(`Error, status code: ${xhr.status}`);
            return;
          }
        };

        xhr.onerror = () => {
          console.log("error", xhr.status, xhr.statusText);
        };

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            cb(null, response);
          } else {
            cb(`Error, status code: ${xhr.status}`);
            return;
          }
        };

        xhr.onerror = () => {
          console.log("error", xhr.status, xhr.statusText);
        };

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Init http module
const http = customHttp();

const category = document.querySelector(".search input");

function choosedCategory(value) {
    if (value) {
        return `category=${value}&`;
    } else {
        return "";
    }
};

const newsService = (function () {
    const apiKey = "db2af74ec48d4d89a23173a4328f04eb",
        apiUrl = "https://newsapi.org/v2";
          
    return {
        topHeadlines(country = "ru", cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        }
    }
}());

const form = document.forms["search_form"],
      countrySelect = form.elements["countries"],
      searchInput = form.elements["search_input"];

if (localStorage.getItem("country")) {
  countrySelect.value = localStorage.getItem("country");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
  localStorage.setItem("country", countrySelect.value);
})

// Load news function
function loadNews() {
  const country = countrySelect.value,
        searchText = searchInput.value;
        
  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
        newsService.everything(searchText, onGetResponse);
  }
  
}

document.addEventListener("DOMContentLoaded", loadNews);

// On get response from server
function onGetResponse(err, res) {
  if (err) {
    alert(err);
  }

  if (!res.articles.length) {
    alert("Error! Please type exact information!");
    return;
  }
    renderNews(res.articles);
    // console.log(res.articles[0]);
}

function renderNews(news) {
    const newsWrapper = document.querySelector(".news_items");
    if (newsWrapper.children.length) {
      newsWrapper.innerHTML = "";
    }
    news.forEach(item => {
        const card = newsTemplate(item);
        newsWrapper.append(card);
    })
}

function newsTemplate(item) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <div class="card_text">
            <div class="card_title">${item.title || ""}</div>
            <div class="card_descr">${item.description || ""}</div>
        </div>
    `;
    card.style.cssText = `
        background: url(${item.urlToImage}) center center/cover no-repeat;
    `;

    return card;
}