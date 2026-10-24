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
      const ul = document.getElementById('blog-feed');
      if (!ul) return;

      // Bloggerの公式JSONPフィードを利用して取得する
      const callbackName = 'handleBloggerFeed_' + Math.random().toString(36).substring(2, 9);
      const script = document.createElement('script');

      // タイムアウト設定
      const timeoutId = setTimeout(() => {
        cleanup();
        if (ul.innerHTML.includes('読み込み中')) {
          ul.innerHTML = '<li>記事の取得に失敗しました。</li>';
        }
      }, 7000);

      const cleanup = () => {
        clearTimeout(timeoutId);
        try {
          delete window[callbackName];
        } catch (_) {
          window[callbackName] = undefined;
        }
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      window[callbackName] = (data) => {
        cleanup();
        ul.innerHTML = '';
        const entries = data?.feed?.entry;
        if (entries && entries.length > 0) {
          entries.slice(0, 5).forEach(entry => {
            const title = entry.title?.$t || '無題';
            const altLink = Array.isArray(entry.link)
              ? entry.link.find(l => l.rel === 'alternate') || entry.link[0]
              : null;
            const href = altLink ? altLink.href : '#';

            let dateStr = '';
            if (entry.published && entry.published.$t) {
              const d = new Date(entry.published.$t);
              if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                dateStr = ` (${year}/${month}/${day})`;
              }
            }

            const li = document.createElement('li');
            li.className = 'mb-1';
            const a = document.createElement('a');
            a.href = href;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = title;
            li.appendChild(a);

            if (dateStr) {
              const span = document.createElement('span');
              span.className = 'text-muted small ms-1';
              span.textContent = dateStr;
              li.appendChild(span);
            }

            ul.appendChild(li);
          });
        } else {
          ul.innerHTML = '<li>記事がありません。</li>';
        }
      };

      script.src = `https://s-kenblog.blogspot.com/feeds/posts/default?alt=json-in-script&callback=${callbackName}&max-results=5`;
      script.onerror = () => {
        cleanup();
        ul.innerHTML = '<li>記事の取得に失敗しました。</li>';
      };

      document.head.appendChild(script);
    }
  },
  mounted() {
    // 初期ページをクエリパラメータ ?p= で指定できるように
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('p');
      if (p && ['home','teams'].includes(p)) {
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