import PUBLIC_MESSAGES from 'src/constants/public-messages.json';

export type PublicMessages = (typeof PUBLIC_MESSAGES)['en'];

export type PublicLocale = keyof typeof PUBLIC_MESSAGES;
