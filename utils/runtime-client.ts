export async function sendRuntimeMessage<T>(
  message: Record<string, unknown>,
): Promise<T> {
  try {
    return (await browser.runtime.sendMessage(message)) as T;
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Extension is unavailable.';
    throw new Error(messageText);
  }
}

export async function respondToCheckIn(
  response: import('./types').CheckInResponse,
) {
  return sendRuntimeMessage({ type: 'respondToCheckIn', response });
}

export async function updateSettings(
  settings: Partial<import('./types').ExtensionSettings>,
) {
  return sendRuntimeMessage({ type: 'updateSettings', settings });
}
