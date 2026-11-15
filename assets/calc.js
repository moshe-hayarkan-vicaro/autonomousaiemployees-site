(function () {
  'use strict';

  var ids = ['roles','salary','overhead','tooling','ramp','attrition','agent','platform','oversight','rate','airmap','coverage'];
  var el = {};
  ids.forEach(function (id) { el[id] = document.getElementById(id); });

  var out = {
    savings: document.getElementById('savings'),
    savingsSub: document.getElementById('savingsSub'),
    humanTotal: document.getElementById('humanTotal'),
    aiTotal: document.getElementById('aiTotal'),
    threeYear: document.getElementById('threeYear'),
    payback: document.getElementById('payback'),
    humanBar: document.getElementById('humanBar'),
    aiBar: document.getElementById('aiBar'),
    humanBarLabel: document.getElementById('humanBarLabel'),
    aiBarLabel: document.getElementById('aiBarLabel'),
    breakdownBody: document.getElementById('breakdownBody'),
    perHour: document.getElementById('perHour')
  };

  function num(id, fallback) {
    var v = parseFloat(el[id].value);
    return isFinite(v) ? v : (fallback || 0);
  }

  function money(n) {
    var neg = n < 0;
    var s = Math.round(Math.abs(n)).toLocaleString('en-US');
    return (neg ? '-$' : '$') + s;
  }

  function moneyShort(n) {
    var a = Math.abs(n);
    var sign = n < 0 ? '-' : '';
    if (a >= 1000000) return sign + '$' + (a / 1000000).toFixed(a >= 10000000 ? 0 : 1) + 'M';
    if (a >= 1000) return sign + '$' + Math.round(a / 1000) + 'k';
    return sign + '$' + Math.round(a);
  }

  function compute() {
    var roles = Math.max(1, num('roles', 1));
    var salary = num('salary');
    var overheadPct = num('overhead') / 100;
    var tooling = num('tooling');
    var rampMonths = Math.min(24, Math.max(0, num('ramp')));
    var attrition = num('attrition');
    var agentMonthly = num('agent');
    var platform = num('platform');
    var oversightHrs = num('oversight');
    var rate = num('rate');
    var onboarding = num('airmap');
    var coverage = Math.min(100, Math.max(5, num('coverage', 70))) / 100;

    var benefits = salary * overheadPct;
    var rampLoss = salary * (rampMonths / 12) * 0.5;
    var humanPerRole = salary + benefits + tooling + rampLoss + attrition;
    var humanTotal = humanPerRole * roles;

    var agentAnnual = agentMonthly * 12 * roles;
    var oversightAnnual = oversightHrs * 52 * rate * roles;
    var onboardingAnnual = onboarding * roles;
    var aiTotal = agentAnnual + platform + oversightAnnual + onboardingAnnual;

    var coveredHumanCost = humanTotal * coverage;
    var savings = coveredHumanCost - aiTotal;

    var humanPerCoveredRole = humanPerRole;
    var aiPerCoveredRole = coverage > 0 ? (aiTotal / roles) / coverage : 0;

    var monthlyNet = savings / 12;
    var payback = monthlyNet > 0 ? (onboarding * roles) / monthlyNet : null;

    var aiYear1 = aiTotal;
    var aiSteady = agentAnnual + platform + oversightAnnual;
    var human3 = humanTotal * 3;
    var ai3 = aiYear1 + aiSteady * 2;
    var threeYearDelta = human3 * coverage - ai3;

    render({
      roles: roles, salary: salary, benefits: benefits, tooling: tooling,
      rampLoss: rampLoss, attrition: attrition, humanPerRole: humanPerRole,
      humanTotal: humanTotal, agentAnnual: agentAnnual, platform: platform,
      oversightAnnual: oversightAnnual, onboardingAnnual: onboardingAnnual,
      aiTotal: aiTotal, coverage: coverage, savings: savings,
      humanPerCoveredRole: humanPerCoveredRole, aiPerCoveredRole: aiPerCoveredRole,
      payback: payback, threeYearDelta: threeYearDelta
    });
  }

  function render(d) {
    out.humanTotal.textContent = moneyShort(d.humanTotal);
    out.aiTotal.textContent = moneyShort(d.aiTotal);
    out.threeYear.textContent = moneyShort(d.threeYearDelta);
    out.payback.textContent = d.payback === null ? 'n/a' : (d.payback < 1 ? '<1 mo' : Math.round(d.payback) + ' mo');

    out.savings.textContent = money(d.savings);
    out.savings.className = 'big' + (d.savings < 0 ? ' neg' : '');
    out.savingsSub.textContent = d.savings >= 0
      ? 'net annual saving at ' + Math.round(d.coverage * 100) + '% coverage'
      : 'net annual cost increase at ' + Math.round(d.coverage * 100) + '% coverage';

    var max = Math.max(d.humanTotal, d.aiTotal, 1);
    out.humanBar.style.width = (d.humanTotal / max * 100) + '%';
    out.aiBar.style.width = (d.aiTotal / max * 100) + '%';
    out.humanBarLabel.textContent = moneyShort(d.humanTotal);
    out.aiBarLabel.textContent = moneyShort(d.aiTotal);

    var rows = [
      ['Base salary (' + d.roles + ' roles)', d.salary * d.roles],
      ['Benefits & overhead', d.benefits * d.roles],
      ['Seats & tooling', d.tooling * d.roles],
      ['Ramp loss', d.rampLoss * d.roles],
      ['Attrition', d.attrition * d.roles],
      ['Human total', d.humanTotal, true],
      ['Agent seats', d.agentAnnual],
      ['Platform & integration', d.platform],
      ['Human oversight', d.oversightAnnual],
      ['Agent onboarding (yr 1)', d.onboardingAnnual],
      ['AI total', d.aiTotal, true]
    ];

    var html = '';
    rows.forEach(function (r) {
      html += '<tr' + (r[2] ? ' class="total"' : '') + '><td>' + r[0] + '</td><td>' + money(r[1]) + '</td></tr>';
    });
    out.breakdownBody.innerHTML = html;

    out.perHour.textContent =
      'Cost per fully-covered role: ' + money(d.humanPerCoveredRole) + ' human vs ' +
      money(d.aiPerCoveredRole) + ' AI. Coverage is the input that moves this most.';
  }

  ids.forEach(function (id) {
    el[id].addEventListener('input', compute);
    el[id].addEventListener('change', compute);
  });

  compute();
})();
