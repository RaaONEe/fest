// Replace the demo fetch in your contact.js submit handler with this:
const WEB_APP_URL = 'REPLACE_WITH_YOUR_WEB_APP_URL';

async function postToAppsScript(data) {
  // data: {name,email,phone,issue,source}
  const resp = await fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  // Apps Script above returns an HtmlOutput containing the JSON string.
  // So we parse text first then JSON.parse.
  const text = await resp.text();
  // Try to extract JSON from text. It may be exactly JSON or wrapped: just JSON string is okay.
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    // If not plain JSON, try to strip HTML tags (in case Apps Script returns "<pre>{...}</pre>")
    const stripped = text.replace(/<[^>]*>/g, '').trim();
    try { json = JSON.parse(stripped); } catch (e) { throw new Error('Invalid server response'); }
  }
  return json;
}

// Example usage inside your form submit handler:
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  successMsg.style.display = 'none';
  failMsg.style.display = 'none';

  if (!validate()) return;

  submitBtn.disabled = true;
  saving.style.display = 'inline';

  try {
    const payload = {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      phone: phoneEl.value.trim(),
      issue: issueEl.value.trim(),
      source: window.location.href
    };

    const result = await postToAppsScript(payload);
    if (result && result.ok) {
      form.reset();
      successMsg.style.display = 'block';
    } else {
      console.error('Server error', result);
      failMsg.style.display = 'block';
    }
  } catch (err) {
    console.error(err);
    failMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    saving.style.display = 'none';
  }
});
