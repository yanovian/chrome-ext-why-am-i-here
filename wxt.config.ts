import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Why Am I Here?',
    short_name: 'Why Am I Here',
    description:
      'Track why you opened tabs and get gentle check-ins before rabbit holes take over.',
    permissions: ['tabs', 'storage', 'alarms'],
    action: {
      default_title: 'Why Am I Here?',
    },
  },
  zip: {
    name: 'why-am-i-here',
  },
});
