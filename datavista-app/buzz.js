/* ============================================================
   巴斯光年 · 看板桌宠（Space Ranger Mascot）
   待机悬浮 / 生成解读时点头确认 / 点击弹出光翼
   对外接口：Buzz.say(text, ms) · Buzz.nod(ms) · Buzz.pop()
   ============================================================ */
(function () {
  'use strict';

  var HID_KEY = 'buzz_mascot_hidden_v1';
  var QUOTES = [
    '飞向宇宙，浩瀚无垠！',
    '收到，态势尽在掌握。',
    '放心，有我盯着呢。',
    '这组数据，稳了。',
    'Reporting for duty!',
  ];

  var CSS = [
    '#buzzMascot{position:fixed;right:18px;bottom:12px;z-index:9999;width:132px;',
    'user-select:none;-webkit-user-select:none;pointer-events:none;',
    'transition:opacity .3s,transform .3s;}',
    '#buzzMascot.buzz-hidden{opacity:0 !important;transform:translateY(26px) !important;}',
    '#buzzMascot .buzz-entry{animation:buzzFlyin .95s cubic-bezier(.2,.8,.25,1.12) both;}',
    '@keyframes buzzFlyin{from{opacity:0;transform:translate(72px,-34px);}to{opacity:1;transform:none;}}',
    '.buzz-fig{pointer-events:auto;cursor:pointer;position:relative;',
    'filter:drop-shadow(0 12px 18px rgba(0,0,0,.5));',
    'animation:buzzFloat 3.4s ease-in-out infinite;}',
    '@keyframes buzzFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}',
    '#buzzMascot.buzz-nod .buzz-fig{animation:buzzNod .55s ease-in-out 4;}',
    '@keyframes buzzNod{0%,100%{transform:translateY(0) rotate(0deg);}',
    '35%{transform:translateY(3px) rotate(5deg);}70%{transform:translateY(1px) rotate(-2deg);}}',
    '#buzzMascot.buzz-pop .buzz-fig{animation:buzzJump .8s cubic-bezier(.3,.9,.3,1.2);}',
    '@keyframes buzzJump{0%{transform:translateY(0);}35%{transform:translateY(-16px) rotate(-3deg);}',
    '65%{transform:translateY(0);}82%{transform:translateY(-5px);}100%{transform:translateY(0);}}',
    '.buzz-wing{transform-box:fill-box;transform-origin:100% 92%;',
    'transform:scale(0);opacity:0;transition:transform .5s cubic-bezier(.2,.9,.3,1.35),opacity .3s;}',
    '#buzzMascot.buzz-pop .buzz-wing{transform:scale(1);opacity:1;}',
    '.buzz-led{animation:buzzLed 1.6s ease-in-out infinite;}',
    '@keyframes buzzLed{0%,100%{opacity:1;}50%{opacity:.25;}}',
    '.buzz-bubble{position:absolute;bottom:calc(100% - 26px);right:58%;max-width:230px;',
    'background:rgba(10,16,26,.96);border:1px solid rgba(34,211,238,.5);color:#e8eef7;',
    'font-size:12px;line-height:1.55;padding:8px 12px;border-radius:10px 10px 2px 10px;',
    'white-space:normal;opacity:0;transform:translateY(6px);transition:.25s;pointer-events:none;',
    'box-shadow:0 10px 26px rgba(0,0,0,.55);font-family:inherit;}',
    '.buzz-bubble.show{opacity:1;transform:none;}',
    '.buzz-bubble::after{content:"";position:absolute;right:16px;top:100%;',
    'border:6px solid transparent;border-top-color:rgba(34,211,238,.5);}',
    '.buzz-close{position:absolute;top:-4px;right:0;width:20px;height:20px;border-radius:50%;',
    'border:1px solid rgba(139,151,173,.4);background:rgba(10,16,26,.9);color:#8b97ad;',
    'font-size:12px;line-height:1;cursor:pointer;pointer-events:auto;transition:.2s;padding:0;}',
    '.buzz-close:hover{color:#f87171;border-color:rgba(248,113,113,.6);}',
    '.buzz-restore{position:fixed;right:18px;bottom:12px;z-index:9999;width:42px;height:42px;',
    'border-radius:50%;border:1px solid rgba(34,211,238,.45);background:rgba(10,16,26,.92);',
    'color:#22d3ee;font-size:19px;cursor:pointer;display:none;align-items:center;justify-content:center;',
    'box-shadow:0 8px 22px rgba(0,0,0,.5);transition:.2s;padding:0;}',
    '.buzz-restore:hover{transform:scale(1.08);border-color:#22d3ee;}',
    '.buzz-restore.show{display:flex;}',
    '@media (max-width:760px){#buzzMascot{width:96px;right:10px;bottom:8px;}',
    '.buzz-restore{right:10px;bottom:8px;}}'
  ].join('');

  var SVG = [
    '<svg viewBox="0 0 200 206" role="img" aria-label="巴斯光年吉祥物" xmlns="http://www.w3.org/2000/svg">',
    '<defs>',
    '<path id="buzzWing" d="M98 128 C 76 114, 50 90, 40 76 C 46 98, 60 122, 88 138 Z"/>',
    '</defs>',
    '<ellipse cx="100" cy="194" rx="38" ry="5.5" fill="rgba(0,0,0,.4)"/>',
    /* 光翼（点击弹出） */
    '<g class="buzz-wing">',
    '<use href="#buzzWing" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2" stroke-linejoin="round"/>',
    '<path d="M90 126 C 72 112, 56 98, 48 88" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="2.5" stroke-linecap="round"/>',
    '<path d="M95 132 C 78 120, 62 106, 52 94" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linecap="round"/>',
    '</g>',
    '<g transform="translate(200,0) scale(-1,1)"><g class="buzz-wing">',
    '<use href="#buzzWing" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2" stroke-linejoin="round"/>',
    '<path d="M90 126 C 72 112, 56 98, 48 88" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="2.5" stroke-linecap="round"/>',
    '<path d="M95 132 C 78 120, 62 106, 52 94" fill="none" stroke="#a3e635" stroke-width="2.5" stroke-linecap="round"/>',
    '</g></g>',
    /* 腿 + 靴 */
    '<rect x="85" y="156" width="12" height="18" rx="5" fill="#f2f6fc" stroke="#d9e2f0" stroke-width="1.5"/>',
    '<rect x="103" y="156" width="12" height="18" rx="5" fill="#f2f6fc" stroke="#d9e2f0" stroke-width="1.5"/>',
    '<rect x="85" y="160" width="12" height="4" rx="2" fill="#a3e635" opacity=".85"/>',
    '<rect x="103" y="160" width="12" height="4" rx="2" fill="#a3e635" opacity=".85"/>',
    '<rect x="78" y="172" width="22" height="16" rx="7" fill="#8b5cf6" stroke="#6d47d9" stroke-width="1.5"/>',
    '<rect x="100" y="172" width="22" height="16" rx="7" fill="#8b5cf6" stroke="#6d47d9" stroke-width="1.5"/>',
    '<rect x="80" y="171" width="18" height="4" rx="2" fill="#f2f6fc"/>',
    '<rect x="102" y="171" width="18" height="4" rx="2" fill="#f2f6fc"/>',
    '<ellipse cx="84" cy="185" rx="7" ry="4" fill="#f2f6fc"/>',
    '<ellipse cx="116" cy="185" rx="7" ry="4" fill="#f2f6fc"/>',
    /* 躯干 */
    '<rect x="72" y="104" width="56" height="50" rx="14" fill="#f2f6fc" stroke="#d9e2f0" stroke-width="1.5"/>',
    '<rect x="86" y="112" width="28" height="18" rx="5" fill="#a3e635"/>',
    '<circle class="buzz-led" cx="100" cy="121" r="2.6" fill="#22d3ee"/>',
    '<circle cx="100" cy="136" r="3.5" fill="#8b5cf6"/>',
    '<path d="M78 140 h10 M112 140 h10" stroke="#c9d4e6" stroke-width="2" stroke-linecap="round" fill="none"/>',
    '<rect x="72" y="146" width="56" height="8" fill="#d9e2f0"/>',
    '<rect x="90" y="150" width="20" height="10" rx="4" fill="#8b5cf6"/>',
    /* 手臂（叉腰） */
    '<path d="M78 108 C 62 111, 53 122, 57 131 C 60 138, 65 142, 71 143" fill="none" stroke="#d9e2f0" stroke-width="14" stroke-linecap="round"/>',
    '<path d="M122 108 C 138 111, 147 122, 143 131 C 140 138, 135 142, 129 143" fill="none" stroke="#d9e2f0" stroke-width="14" stroke-linecap="round"/>',
    '<path d="M78 108 C 62 111, 53 122, 57 131 C 60 138, 65 142, 71 143" fill="none" stroke="#f2f6fc" stroke-width="10.5" stroke-linecap="round"/>',
    '<path d="M122 108 C 138 111, 147 122, 143 131 C 140 138, 135 142, 129 143" fill="none" stroke="#f2f6fc" stroke-width="10.5" stroke-linecap="round"/>',
    '<circle cx="57" cy="127" r="4.6" fill="#8b5cf6"/>',
    '<circle cx="143" cy="127" r="4.6" fill="#8b5cf6"/>',
    '<circle cx="78" cy="108" r="6.5" fill="#f2f6fc" stroke="#d9e2f0" stroke-width="1.5"/>',
    '<circle cx="122" cy="108" r="6.5" fill="#f2f6fc" stroke="#d9e2f0" stroke-width="1.5"/>',
    '<circle cx="71" cy="143" r="6.2" fill="#eef3fa" stroke="#c9d4e6" stroke-width="1.5"/>',
    '<circle cx="129" cy="143" r="6.2" fill="#eef3fa" stroke="#c9d4e6" stroke-width="1.5"/>',
    /* 颈 + 领 */
    '<rect x="92" y="90" width="16" height="10" fill="#f0b98d"/>',
    '<rect x="82" y="98" width="36" height="10" rx="4" fill="#8b5cf6"/>',
    /* 头 */
    '<circle cx="100" cy="70" r="26" fill="#ffd9b8"/>',
    '<circle cx="76" cy="70" r="5" fill="#8b5cf6"/>',
    '<circle cx="124" cy="70" r="5" fill="#8b5cf6"/>',
    '<path d="M76 61 A26 26 0 1 1 124 61 Z" fill="#8b5cf6" stroke="#6d47d9" stroke-width="1.5"/>',
    '<circle cx="100" cy="46" r="4.5" fill="#c4b5fd" stroke="#6d47d9" stroke-width="1.5"/>',
    '<path d="M84 57 L93 59 M107 59 L116 57" stroke="#8a5a3b" stroke-width="2" stroke-linecap="round" fill="none"/>',
    '<ellipse cx="91" cy="68" rx="3.2" ry="4.2" fill="#1e2430"/>',
    '<ellipse cx="109" cy="68" rx="3.2" ry="4.2" fill="#1e2430"/>',
    '<circle cx="90" cy="66.5" r="1.1" fill="#fff"/>',
    '<circle cx="108" cy="66.5" r="1.1" fill="#fff"/>',
    '<path d="M91 82 Q100 89 110 81" fill="none" stroke="#a85a38" stroke-width="2.2" stroke-linecap="round"/>',
    /* 透明头盔 */
    '<circle cx="100" cy="62" r="42" fill="rgba(150,220,255,.08)" stroke="rgba(140,235,255,.45)" stroke-width="2"/>',
    '<path d="M66 42 A42 42 0 0 1 92 24" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="3.5" stroke-linecap="round"/>',
    '</svg>'
  ].join('');

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var wasHidden = false;
    try { wasHidden = localStorage.getItem(HID_KEY) === '1'; } catch (e) {}

    var root = document.createElement('div');
    root.id = 'buzzMascot';
    if (wasHidden) root.classList.add('buzz-hidden');
    else root.classList.add('buzz-entry');
    root.innerHTML =
      '<div class="buzz-bubble"></div>' +
      '<button class="buzz-close" title="收起巴斯光年" aria-label="收起巴斯光年">×</button>' +
      '<div class="buzz-fig">' + SVG + '</div>';
    document.body.appendChild(root);

    var restore = document.createElement('button');
    restore.className = 'buzz-restore';
    restore.title = '召唤巴斯光年';
    restore.setAttribute('aria-label', '召唤巴斯光年');
    restore.textContent = '🚀';
    document.body.appendChild(restore);
    if (wasHidden) restore.classList.add('show');

    var bubble = root.querySelector('.buzz-bubble');
    var hideTimer = null;
    var nodTimer = null;
    var popTimer = null;

    function say(text, ms) {
      bubble.textContent = text;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { bubble.classList.remove('show'); }, ms || 2800);
    }
    function nod(ms) {
      root.classList.remove('buzz-pop');
      root.classList.add('buzz-nod');
      clearTimeout(nodTimer);
      nodTimer = setTimeout(function () { root.classList.remove('buzz-nod'); }, ms || 2300);
    }
    function pop() {
      root.classList.remove('buzz-nod');
      root.classList.remove('buzz-pop');
      void root.offsetWidth; /* 重新触发动画 */
      root.classList.add('buzz-pop');
      clearTimeout(popTimer);
      popTimer = setTimeout(function () { root.classList.remove('buzz-pop'); }, 1400);
      say(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }

    root.querySelector('.buzz-fig').addEventListener('click', pop);
    root.querySelector('.buzz-close').addEventListener('click', function (e) {
      e.stopPropagation();
      root.classList.add('buzz-hidden');
      restore.classList.add('show');
      try { localStorage.setItem(HID_KEY, '1'); } catch (err) {}
    });
    restore.addEventListener('click', function () {
      root.classList.remove('buzz-hidden');
      restore.classList.remove('show');
      root.classList.remove('buzz-entry');
      void root.offsetWidth;
      root.classList.add('buzz-entry');
      try { localStorage.setItem(HID_KEY, '0'); } catch (err) {}
      pop();
    });

    if (!wasHidden) {
      setTimeout(function () { say('太空骑士上线，数据交给我。'); }, 1100);
    }

    window.Buzz = { say: say, nod: nod, pop: pop };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
