export const ROLE_COPY = {
  influencer: {
    title: 'Creator Assistant',
    subtitle: 'Get help with pitches, profile copy, content ideas, and campaign strategy.',
    starters: [
      'Write a strong application message for a beauty campaign.',
      'Suggest 5 Reel ideas for a travel collaboration.',
      'Improve my creator bio so brands trust me faster.',
    ],
  },
  brand: {
    title: 'Brand Assistant',
    subtitle: 'Draft campaign briefs, shortlist creators, and write faster partner messages.',
    starters: [
      'Write a campaign brief for a skincare launch.',
      'What should I look for when screening influencer applications?',
      'Draft a polite rejection message for an applicant.',
    ],
  },
  admin: {
    title: 'Platform Assistant',
    subtitle: 'Use AI to write clearer moderation, support, and operations copy.',
    starters: [
      'Write a calm dispute-resolution message.',
      'Draft a warning notice for a policy violation.',
      'Summarize the best next steps for a delayed payment complaint.',
    ],
  },
};

export const createWelcomeMessage = (role) => {
  const copy = ROLE_COPY[role] || ROLE_COPY.influencer;

  return {
    role: 'assistant',
    content: `Hi! I can help with ${copy.subtitle.toLowerCase()}`,
  };
};

export const getAssistantCopy = (role) => ROLE_COPY[role] || ROLE_COPY.influencer;
