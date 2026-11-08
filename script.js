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
    // ナビゲーションリンクをクリックしたときのスクロール制御
    handleNavClick(selector) {
      if (this.currentPage !== 'home') {
        this.currentPage = 'home';
      }
      this.$nextTick(() => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
      // スマホ向けにナビゲーションメニューが開いていれば閉じる
      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    },
    fetchBlogFeed() {
      const container = document.getElementById('blog-cards-container');
      const ticker = document.getElementById('latest-blog-bar');
      const ul = document.getElementById('blog-feed');

      if (!container && !ticker && !ul) return;

      // Bloggerの公式JSONPフィードを利用して取得する
      const callbackName = 'handleBloggerFeed_' + Math.random().toString(36).substring(2, 9);
      const script = document.createElement('script');

      // タイムアウト設定
      const timeoutId = setTimeout(() => {
        cleanup();
        if (container && container.innerHTML.includes('読み込み中')) {
          container.innerHTML = '<div class="col-12 text-center text-muted py-4">記事の取得に失敗しました。</div>';
        }
        if (ul && ul.innerHTML.includes('読み込み中')) {
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
        const entries = data?.feed?.entry;

        if (!entries || entries.length === 0) {
          if (container) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-4">記事がありません。</div>';
          }
          if (ul) {
            ul.innerHTML = '<li>記事がありません。</li>';
          }
          return;
        }

        // 最新記事をカルーセル直下のティッカーバーに反映
        if (ticker) {
          const firstEntry = entries[0];
          const firstTitle = firstEntry.title?.$t || '最新記事';
          const firstLinkObj = Array.isArray(firstEntry.link)
            ? firstEntry.link.find(l => l.rel === 'alternate') || firstEntry.link[0]
            : null;
          const firstHref = firstLinkObj ? firstLinkObj.href : '#';

          let firstDate = '';
          if (firstEntry.published && firstEntry.published.$t) {
            const d = new Date(firstEntry.published.$t);
            if (!isNaN(d.getTime())) {
              firstDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
            }
          }

          ticker.innerHTML = `
            <div class="d-flex flex-wrap align-items-center">
              <span class="ticker-tag me-2 my-1">NEWS</span>
              <span class="text-secondary small me-2 my-1">${firstDate}</span>
              <a href="${firstHref}" target="_blank" rel="noopener" class="text-decoration-none text-dark fw-semibold my-1 flex-grow-1 text-truncate">${firstTitle}</a>
              <a href="${firstHref}" target="_blank" rel="noopener" class="text-primary small text-decoration-none ms-sm-auto my-1">記事を読む &rarr;</a>
            </div>
          `;
        }

        // カードコンテナへのレンダリング (最新3件)
        if (container) {
          container.innerHTML = '';
          entries.slice(0, 3).forEach(entry => {
            const title = entry.title?.$t || '無題';
            const altLink = Array.isArray(entry.link)
              ? entry.link.find(l => l.rel === 'alternate') || entry.link[0]
              : null;
            const href = altLink ? altLink.href : '#';

            // 投稿日
            let dateStr = '';
            if (entry.published && entry.published.$t) {
              const d = new Date(entry.published.$t);
              if (!isNaN(d.getTime())) {
                dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
              }
            }

            // アイキャッチ画像の抽出
            let imageUrl = '';
            if (entry.media$thumbnail && entry.media$thumbnail.url) {
              // 高解像度画像に置換 (s72-c から s600 へ)
              imageUrl = entry.media$thumbnail.url.replace(/\/s[0-9]+(-c)?\//, '/s600/');
            } else if (entry.content && entry.content.$t) {
              const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch && imgMatch[1]) {
                imageUrl = imgMatch[1];
              }
            }

            // 画像があるかないかで出し分ける
            let imgBlock = '';
            if (imageUrl) {
              imgBlock = `
                <a href="${href}" target="_blank" rel="noopener" class="blog-img-wrapper">
                  <img src="${imageUrl}" class="blog-card-img" alt="${title}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                  <div class="blog-no-photo" style="display: none;">写真なし</div>
                </a>
              `;
            } else {
              imgBlock = `
                <a href="${href}" target="_blank" rel="noopener" class="blog-img-wrapper text-decoration-none">
                  <div class="blog-no-photo">写真なし</div>
                </a>
              `;
            }

            // 本文の抜粋文 (HTMLタグ除去して先頭75文字)
            let snippet = '';
            const rawContent = (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || '';
            if (rawContent) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = rawContent;
              const textContent = tempDiv.textContent || tempDiv.innerText || '';
              const cleaned = textContent.replace(/\s+/g, ' ').trim();
              if (cleaned.length > 75) {
                snippet = cleaned.substring(0, 75) + '...';
              } else {
                snippet = cleaned;
              }
            }

            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
              <div class="blog-item">
                ${imgBlock}
                <div class="blog-body">
                  <div class="blog-date">${dateStr}</div>
                  <h3 class="blog-title">
                    <a href="${href}" target="_blank" rel="noopener">${title}</a>
                  </h3>
                  <p class="blog-snippet">${snippet}</p>
                  <div class="mt-auto pt-2 border-top">
                    <a href="${href}" target="_blank" rel="noopener" class="text-primary small text-decoration-none fw-semibold">続きを読む &rarr;</a>
                  </div>
                </div>
              </div>
            `;
            container.appendChild(col);
          });
        }

        // リスト表示が残っている場合の互換用
        if (ul) {
          ul.innerHTML = '';
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
                dateStr = ` (${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')})`;
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
        }
      };

      script.src = `https://s-kenblog.blogspot.com/feeds/posts/default?alt=json-in-script&callback=${callbackName}&max-results=6`;
      script.onerror = () => {
        cleanup();
        if (container) {
          container.innerHTML = '<div class="col-12 text-center text-muted py-4">記事の取得に失敗しました。</div>';
        }
        if (ul) {
          ul.innerHTML = '<li>記事の取得に失敗しました。</li>';
        }
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