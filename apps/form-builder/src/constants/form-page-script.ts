// Runs in the visitor's browser. Fills in defaults that depend on the
// visitor's clock and values passed in the link, shows the steps one at a
// time, collects the inputs into the submission shape, posts it back to the
// same URL and reports its height to an embedding page so the iframe can
// resize.
export const FORM_PAGE_SCRIPT = `
(function () {
  var form = document.querySelector('form');
  var message = document.getElementById('message');
  var button = form.querySelector('button[type=submit]');
  var back = form.querySelector('[data-back]');
  var next = form.querySelector('[data-next]');
  var progress = form.querySelector('[data-progress]');
  var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var current = 0;

  function reportHeight() {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'twenty-form-height', height: Math.ceil(document.body.getBoundingClientRect().height) }, '*');
    }
  }

  function showMessage(kind, lines) {
    message.className = 'message ' + kind;
    message.textContent = '';
    if (lines.length === 1) {
      message.textContent = lines[0];
    } else {
      var list = document.createElement('ul');
      lines.forEach(function (line) {
        var item = document.createElement('li');
        item.textContent = line;
        list.appendChild(item);
      });
      message.appendChild(list);
    }
    message.hidden = false;
    reportHeight();
  }

  function pad(number) {
    return (number < 10 ? '0' : '') + number;
  }

  function localDate(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function setDateTime(input, value) {
    var date = value === 'now' ? new Date() : new Date(value);
    if (!isNaN(date.getTime())) {
      input.value = localDate(date) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    }
  }

  function prefill() {
    form.querySelectorAll('[data-default]').forEach(function (input) {
      if (input.dataset.kind === 'datetime') {
        setDateTime(input, input.dataset.default);
      } else {
        input.value = localDate(new Date());
      }
    });
    // A link can carry values, e.g. ?person.emails=ann@example.com
    var params = new URLSearchParams(window.location.search);
    form.querySelectorAll('[data-record]').forEach(function (input) {
      var name = input.dataset.record + '.' + input.dataset.field + (input.dataset.part ? '.' + input.dataset.part : '');
      if (!params.has(name)) return;
      var value = params.get(name);
      if (input.dataset.kind === 'boolean') {
        input.checked = value === 'true' || value === '1';
      } else if (input.dataset.kind === 'multi') {
        input.checked = params.getAll(name).indexOf(input.value) !== -1;
      } else if (input.dataset.kind === 'datetime') {
        setDateTime(input, value);
      } else {
        input.value = value;
      }
    });
  }

  function showStep(index, focus) {
    current = index;
    steps.forEach(function (step, position) {
      step.hidden = position !== current;
    });
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    button.hidden = current !== steps.length - 1;
    if (steps.length > 1) {
      progress.textContent = form.dataset.stepLabel.replace('{current}', current + 1).replace('{total}', steps.length);
      progress.hidden = false;
    }
    if (focus) {
      var first = steps[current].querySelector('input, select, textarea');
      if (first) first.focus();
    }
    reportHeight();
  }

  // Only the step on screen is checked: the browser cannot point at a
  // field of a step that is not shown.
  function isStepValid() {
    var controls = steps[current].querySelectorAll('input, select, textarea');
    for (var index = 0; index < controls.length; index++) {
      if (!controls[index].checkValidity()) {
        controls[index].reportValidity();
        return false;
      }
    }
    return true;
  }

  function collect() {
    var values = {};
    form.querySelectorAll('[data-record]').forEach(function (input) {
      var record = (values[input.dataset.record] = values[input.dataset.record] || {});
      var field = input.dataset.field;
      var part = input.dataset.part;
      var value = input.value;
      if (input.dataset.kind === 'boolean') {
        record[field] = input.checked;
      } else if (input.dataset.kind === 'multi') {
        record[field] = record[field] || [];
        if (input.checked) record[field].push(value);
      } else if (input.dataset.kind === 'datetime') {
        record[field] = value ? new Date(value).toISOString() : '';
      } else if (part) {
        record[field] = record[field] || {};
        record[field][part] = value;
      } else {
        record[field] = value;
      }
    });
    return values;
  }

  function collectLists() {
    var lists = {};
    form.querySelectorAll('[data-list]').forEach(function (input) {
      lists[input.dataset.list] = input.checked;
    });
    return lists;
  }

  form.noValidate = true;

  next.addEventListener('click', function () {
    if (isStepValid()) {
      message.hidden = true;
      showStep(current + 1, true);
    }
  });

  back.addEventListener('click', function () {
    message.hidden = true;
    showStep(current - 1, true);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!isStepValid()) return;
    // Enter in an earlier step moves on instead of submitting.
    if (current < steps.length - 1) {
      showStep(current + 1, true);
      return;
    }
    button.disabled = true;
    message.hidden = true;
    fetch(window.location.pathname, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ values: collect(), lists: collectLists(), website: form.elements.website.value, language: document.documentElement.lang })
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (response.ok && body.ok) {
            form.hidden = true;
            showMessage('success', [form.dataset.success]);
          } else {
            button.disabled = false;
            showMessage('error', body.errors && body.errors.length ? body.errors : [form.dataset.genericError]);
          }
        });
      })
      .catch(function () {
        button.disabled = false;
        showMessage('error', [form.dataset.networkError]);
      });
  });

  prefill();
  showStep(0, false);
  window.addEventListener('load', reportHeight);
  window.addEventListener('resize', reportHeight);
})();
`;
