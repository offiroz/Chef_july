/**
 * Chef July Animation Manager
 *
 * Manages GIF animations with CSS fallback placeholders.
 * When real GIF files exist in /assets/gifs/, they are shown.
 * When they don't, CSS animations are displayed instead.
 *
 * Usage:
 *   <div id="my-anim" class="anim-container"></div>
 *   <script>
 *     ChefAnim.init('my-anim', 'idle');
 *     ChefAnim.play('my-anim', 'loading');
 *     ChefAnim.play('my-anim', 'success');
 *   </script>
 */

const ChefAnim = (() => {
  // GIF file paths
  const GIF_MAP = {
    idle: '/assets/gifs/idle.gif',
    loading: '/assets/gifs/loading.gif',
    success: '/assets/gifs/success.gif',
    save: '/assets/gifs/save.gif',
    thankyou: '/assets/gifs/thankyou.gif'
  };

  // CSS fallback HTML for each animation state
  const FALLBACK_MAP = {
    idle: `
      <div class="anim-fallback anim-idle">
        <span class="chef-icon">&#x1F468;&#x200D;&#x1F373;</span>
      </div>
    `,
    loading: `
      <div class="anim-fallback anim-loading">
        <span class="cook-icon">&#x1F952;</span>
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `,
    success: `
      <div class="anim-fallback anim-success">
        <span class="success-icon">&#x1F389;</span>
        <div class="sparkles">
          <span class="sparkle">&#10024;</span>
          <span class="sparkle">&#9733;</span>
          <span class="sparkle">&#10024;</span>
          <span class="sparkle">&#9733;</span>
          <span class="sparkle">&#10024;</span>
          <span class="sparkle">&#9733;</span>
        </div>
      </div>
    `,
    save: `
      <div class="anim-fallback anim-save">
        <span class="save-item">&#x1F4D6;</span>
        <span class="save-box">&#x1F4E6;</span>
        <span class="save-check">&#10004;</span>
      </div>
    `,
    thankyou: `
      <div class="anim-fallback anim-thankyou">
        <span class="thankyou-icon">&#x1F647;</span>
        <div class="hearts">
          <span class="heart">&#10084;</span>
          <span class="heart">&#10084;</span>
          <span class="heart">&#10084;</span>
        </div>
      </div>
    `
  };

  // Track which GIFs actually exist
  const gifExists = {};

  // Track active containers
  const containers = {};

  /**
   * Initialize an animation container
   * @param {string} containerId - DOM element ID
   * @param {string} state - Initial animation state (idle/loading/success/save/thankyou)
   * @param {string} [size] - Size class: 'small', 'large', or default (medium)
   */
  function init(containerId, state = 'idle', size = '') {
    const el = document.getElementById(containerId);
    if (!el) return;

    containers[containerId] = { el, currentState: null, size };
    play(containerId, state);
  }

  /**
   * Play an animation state
   * @param {string} containerId - DOM element ID
   * @param {string} state - Animation state
   */
  function play(containerId, state) {
    const container = containers[containerId];
    if (!container) return;

    const { el, size } = container;
    container.currentState = state;

    // Fade out current content
    el.classList.add('anim-fade-out');

    setTimeout(() => {
      el.innerHTML = '';
      el.classList.remove('anim-fade-out');

      // Try to load real GIF first
      if (GIF_MAP[state]) {
        if (gifExists[state] === true) {
          // Known to exist - use it directly
          showGif(el, state, size);
        } else if (gifExists[state] === false) {
          // Known to not exist - use fallback
          showFallback(el, state, size);
        } else {
          // Unknown - try to load
          const img = new Image();
          img.onload = () => {
            gifExists[state] = true;
            // Only update if state hasn't changed
            if (container.currentState === state) {
              el.innerHTML = '';
              showGif(el, state, size);
            }
          };
          img.onerror = () => {
            gifExists[state] = false;
            if (container.currentState === state) {
              el.innerHTML = '';
              showFallback(el, state, size);
            }
          };
          img.src = GIF_MAP[state];

          // Show fallback immediately while checking
          showFallback(el, state, size);
        }
      } else {
        showFallback(el, state, size);
      }

      el.classList.add('anim-fade-in');
      setTimeout(() => el.classList.remove('anim-fade-in'), 300);
    }, 150);
  }

  function showGif(el, state, size) {
    const sizeMap = { small: '120px', large: '250px', '': '200px' };
    const dim = sizeMap[size] || '200px';
    const img = document.createElement('img');
    img.src = GIF_MAP[state];
    img.alt = state;
    img.style.width = dim;
    img.style.height = dim;
    img.style.objectFit = 'contain';
    el.appendChild(img);
  }

  function showFallback(el, state, size) {
    const html = FALLBACK_MAP[state] || FALLBACK_MAP.idle;
    el.innerHTML = html;

    // Apply size class
    const fallbackEl = el.querySelector('.anim-fallback');
    if (fallbackEl && size) {
      fallbackEl.classList.add(size);
    }
  }

  /**
   * Play an animation temporarily, then return to a state
   * @param {string} containerId
   * @param {string} state - Temporary animation
   * @param {number} duration - Duration in ms
   * @param {string} returnState - State to return to
   */
  function playOnce(containerId, state, duration = 2000, returnState = 'idle') {
    play(containerId, state);
    setTimeout(() => play(containerId, returnState), duration);
  }

  return { init, play, playOnce };
})();
