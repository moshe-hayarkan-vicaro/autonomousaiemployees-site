/* autonomousaiemployees.com — catalog search. No dependencies. */
(function () {
  var input = document.getElementById('q');
  if (!input) return;

  var cards = [].slice.call(document.querySelectorAll('.role-card'));
  var sections = [].slice.call(document.querySelectorAll('.section'));
  var empty = document.getElementById('empty');
  var catNav = document.querySelector('.cat-nav');

  function norm(s) { return (s || '').toLowerCase(); }

  function apply() {
    var q = norm(input.value).trim();
    var shown = 0;

    cards.forEach(function (c) {
      var hay = norm(c.getAttribute('data-name')) + ' ' +
                norm(c.getAttribute('data-uses')) + ' ' +
                norm(c.getAttribute('data-cat')) + ' ' +
                norm(c.textContent);
      var hit = !q || hay.indexOf(q) !== -1;
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });

    sections.forEach(function (s) {
      var grid = s.querySelector('.role-grid');
      if (!grid) return;
      var any = [].slice.call(grid.querySelectorAll('.role-card')).some(function (c) {
        return c.style.display !== 'none';
      });
      s.style.display = any ? '' : 'none';
    });

    if (empty) empty.className = shown === 0 ? 'empty-note on' : 'empty-note';
    if (catNav) catNav.style.display = q ? 'none' : '';
  }

  input.addEventListener('input', apply);

  try {
    var p = new URLSearchParams(window.location.search);
    var q0 = p.get('q');
    if (q0) { input.value = q0; apply(); }
  } catch (e) {}

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });
})();
