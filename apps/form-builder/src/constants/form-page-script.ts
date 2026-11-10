// Runs in the visitor's browser. Collects the inputs into the submission
// shape, posts it back to the same URL and reports its height to an
// embedding page so the iframe can resize.
export const FORM_PAGE_SCRIPT = `
(function () {
  var form = document.querySelector('form');
  var message = document.getElementById('message');
  var button = form.querySelector('button');

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

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    button.disabled = true;
    message.hidden = true;
    fetch(window.location.pathname, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ values: collect(), website: form.elements.website.value, language: document.documentElement.lang })
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

  window.addEventListener('load', reportHeight);
  window.addEventListener('resize', reportHeight);
  reportHeight();
})();
`;
