/* autonomousaiemployees.com - catalog filter */
(function () {
  'use strict';

  var q = document.getElementById('q');
  var chips = document.getElementById('chips');
  var countEl = document.getElementById('filtercount');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.role-card'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.cat'));
  var activeCat = 'all';

  if (!q || !chips || !cards.length) return;

  function apply() {
    var term = (q.value || '').trim().toLowerCase();
    var shown = 0;

    cards.forEach(function (card) {
      var catOk = activeCat === 'all' || card.getAttribute('data-cat') === activeCat;
      var textOk = !term || (card.textContent || '').toLowerCase().indexOf(term) !== -1;
      var visible = catOk && textOk;
      card.classList.toggle('hidden', !visible);
      if (visible) shown++;
    });

    sections.forEach(function (sec) {
      var any = sec.querySelectorAll('.role-card:not(.hidden)').length > 0;
      sec.classList.toggle('hidden', !any);
    });

    if (!term && activeCat === 'all') {
      countEl.textContent = '';
    } else {
      countEl.textContent = shown + (shown === 1 ? ' role matches' : ' roles match');
    }
  }

  chips.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    Array.prototype.forEach.call(chips.querySelectorAll('.chip'), function (c) {
      c.classList.remove('on');
    });
    btn.classList.add('on');
    activeCat = btn.getAttribute('data-cat') || 'all';
    apply();
  });

  q.addEventListener('input', apply);

  var hash = (location.hash || '').replace('#', '');
  if (hash && hash !== 'roles') {
    var match = chips.querySelector('.chip[data-cat="' + hash + '"]');
    if (match) {
      Array.prototype.forEach.call(chips.querySelectorAll('.chip'), function (c) {
        c.classList.remove('on');
      });
      match.classList.add('on');
      activeCat = hash;
      apply();
    }
  }
})();
