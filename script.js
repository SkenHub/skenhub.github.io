const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: 'home',
    };
  },
  methods: {
    scrollTo(selector) {
      if (this.currentPage === 'home') {
        this.$nextTick(() => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    },
    fetchBlogFeed() {
      fetch('https://api.rss2json.com/v1/api.json?rss_url=https://s-kenblog.blogspot.com/feeds/posts/default')
        .then(res => res.json())
        .then(data => {
          const ul = document.getElementById('blog-feed');
          if (ul) {
            ul.innerHTML = ''; // Clear loading message
            if (data.items) {
              data.items.slice(0, 5).forEach(entry => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${entry.link}" target="_blank">${entry.title}</a>`;
                ul.appendChild(li);
              });
            } else {
               ul.innerHTML = '<li>記事を取得できませんでした。</li>';
            }
          }
        })
        .catch(() => {
          const ul = document.getElementById('blog-feed');
          if (ul) {
            ul.innerHTML = '<li>記事の取得に失敗しました。</li>';
          }
        });
    }
  },
  mounted() {
    // 初期ページをクエリパラメータ ?p= で指定できるように
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('p');
      if (p && ['home','teams','mechanical','electric'].includes(p)) {
        this.currentPage = p;
      }
    } catch {}
    if (this.currentPage === 'home') {
      this.fetchBlogFeed();
    }
  },
  watch: {
      currentPage(newPage) {
          if (newPage === 'home') {
              this.$nextTick(() => {
                  this.fetchBlogFeed();
              });
          }
      }
  }
}).mount('#app');