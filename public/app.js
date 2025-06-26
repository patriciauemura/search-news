const searchForm = document.querySelector('form');
const searchInput = document.querySelector('#query');
const message = document.querySelector('#results');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const topic = searchInput.value.trim();
    if (!topic) {
        message.textContent = 'You must provide a topic.';
        return;
    }
    message.textContent = 'Loading...';
    fetch(`/news?q=${encodeURIComponent(topic)}`)
        .then(async (response) => {
            message.innerHTML = '';
            let data;
            const statusMsg = document.createElement('div');
            statusMsg.setAttribute('aria-live', 'polite');
            try {
                if (!response.ok) {
                    throw new Error(`Erro: ${response.status} ${response.statusText}`);
                }
                data = await response.json();
            } catch (err) {
                statusMsg.textContent = 'Error searching for news: ' + err.message;
                message.appendChild(statusMsg);
                return;
            }
            if (data.error) {
                statusMsg.textContent = data.error;
                message.appendChild(statusMsg);
            } else {
                statusMsg.textContent = `Results for "${data.topic}". Showing up to 10 lastest articles.`;
                message.appendChild(statusMsg);

                const articlesContainer = document.createElement('div');
                articlesContainer.className = 'articles-container';

                data.articles.forEach(article => {
                    const card = document.createElement('div');
                    card.className = 'news-card';

                    if (article.urlToImage) {
                        const img = document.createElement('img');
                        img.src = article.urlToImage;
                        img.alt = article.title;
                        img.className = 'news-image';
                        card.appendChild(img);
                    }

                    const title = document.createElement('h3');
                    title.textContent = article.title;
                    title.className = 'news-title';
                    card.appendChild(title);

                    // Adiciona a data de publicação
                    if (article.publishedAt) {
                        const date = document.createElement('span');
                        const pubDate = new Date(article.publishedAt);
                        date.textContent = `Published: ${pubDate.toLocaleDateString()} ${pubDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                        date.className = 'news-date';
                        card.appendChild(date);
                    }

                    if (article.description) {
                        const desc = document.createElement('p');
                        desc.textContent = article.description;
                        desc.className = 'news-desc';
                        card.appendChild(desc);
                    }

                    const link = document.createElement('a');
                    link.href = article.url;
                    link.textContent = 'Read more';
                    link.target = '_blank';
                    link.className = 'news-link';
                    card.appendChild(link);

                    articlesContainer.appendChild(card);
                });

                message.appendChild(articlesContainer);
            }
        })
        .catch((err) => {
            message.innerHTML = '';
            const statusMsg = document.createElement('div');
            statusMsg.setAttribute('aria-live', 'polite');
            statusMsg.textContent = 'Network error: ' + err.message;
            message.appendChild(statusMsg);
        });
});