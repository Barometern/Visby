const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value, max = 2000) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateLocalizedStrings(fieldName, value, max = 5000) {
  const languages = ['en', 'sv', 'de'];

  if (!value || typeof value !== 'object') {
    return `${fieldName} must contain translated values.`;
  }

  for (const language of languages) {
    if (!isNonEmptyString(value[language], max)) {
      return `${fieldName}.${language} is required.`;
    }
  }

  return null;
}

export function validateAuthPayload(payload, mode = 'login') {
  const email = normalizeString(payload?.email).toLowerCase();
  const password = typeof payload?.password === 'string' ? payload.password : '';

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 200) {
    return { ok: false, error: 'Password is too long.' };
  }

  return { ok: true, value: { email, password, mode } };
}

export function validateLocationPayload(location) {
  if (!location || typeof location !== 'object') {
    return { ok: false, error: 'Location payload is required.' };
  }

  if (!isNonEmptyString(location.id, 120)) {
    return { ok: false, error: 'location.id is required.' };
  }

  if (!isNonEmptyString(location.qrCode, 200)) {
    return { ok: false, error: 'A QR code value is required.' };
  }

  const nameError = validateLocalizedStrings('name', location.name, 160);
  if (nameError) return { ok: false, error: nameError };

  const clueError = validateLocalizedStrings('clue', location.clue, 600);
  if (clueError) return { ok: false, error: clueError };

  const descriptionError = validateLocalizedStrings('description', location.description, 2000);
  if (descriptionError) return { ok: false, error: descriptionError };

  const readMoreError = validateLocalizedStrings('readMore', location.readMore, 6000);
  if (readMoreError) return { ok: false, error: readMoreError };

  const lat = Number(location.coordinates?.lat);
  const lng = Number(location.coordinates?.lng);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { ok: false, error: 'Latitude must be a valid number between -90 and 90.' };
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { ok: false, error: 'Longitude must be a valid number between -180 and 180.' };
  }

  if (!isNonEmptyString(location.googleMapsUrl, 2000)) {
    return { ok: false, error: 'A Google Maps link is required.' };
  }

  try {
    new URL(location.googleMapsUrl);
  } catch {
    return { ok: false, error: 'Google Maps link must be a valid URL.' };
  }

  if (!Array.isArray(location.images)) {
    return { ok: false, error: 'images must be an array.' };
  }

  for (const image of location.images) {
    if (!isNonEmptyString(image, 2000)) {
      return { ok: false, error: 'Each image entry must be a non-empty URL string.' };
    }

    try {
      new URL(image);
    } catch {
      return { ok: false, error: 'Each image must be a valid URL.' };
    }
  }

  return {
    ok: true,
    value: {
      id: location.id.trim(),
      qrCode: location.qrCode.trim(),
      name: location.name,
      description: location.description,
      readMore: location.readMore,
      clue: location.clue,
      coordinates: { lat, lng },
      googleMapsUrl: location.googleMapsUrl.trim(),
      images: location.images.map((image) => image.trim()),
      scanCount: Number.isFinite(Number(location.scanCount)) ? Number(location.scanCount) : 0,
    },
  };
}
